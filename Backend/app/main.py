from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
import httpx
# from google_play_scraper import app as get_app_info
from google_play_scraper import app as get_app_info, search
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String
)


from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
    Session
)

from passlib.context import CryptContext

# OAuth
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from urllib.parse import quote
import os
import tempfile

BASE_DIR = os.path.dirname(__file__)
load_dotenv()


# ---------------- APP ----------------

app = FastAPI(title="AI Privacy Auditor")


# ---------------- SESSION ----------------

app.add_middleware(
    SessionMiddleware,
    secret_key="supersecret123"
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173", 
#         "https://ai-privacy-auditor.vercel.app", # Сенің фронтың
#         "https://ai-privacy-auditor.onrender.com" # Сенің бэкің
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-privacy-auditor-1jse.vercel.app", # Нақты фронт сілтемесі
        "http://localhost:5173" # Локальді тексеру үшін қалдыр
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")



# ---------------- DATABASE ----------------

DATABASE_URL = os.getenv("DATABASE_URL")

def _get_sqlite_database_url():
    default_db_path = os.path.join(BASE_DIR, "users.db")
    temp_db_path = os.path.join(tempfile.gettempdir(), "users.db")

    if os.getenv("VERCEL") == "1":
        return f"sqlite:///{temp_db_path}"

    if os.path.isdir(BASE_DIR) and os.access(BASE_DIR, os.W_OK):
        return f"sqlite:///{default_db_path}"

    return f"sqlite:///{temp_db_path}"

if not DATABASE_URL:
    DATABASE_URL = _get_sqlite_database_url()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True
    )

    email = Column(
        String,
        unique=True
    )

    username = Column(String)

    password_hash = Column(String)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AnalysisRequest(BaseModel):
    serviceName: str
    permissions: list[str]

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ---------------- PASSWORDS ----------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password):
    return pwd_context.hash(
        password[:72]
    )

def verify_password(password, hashed):
    return pwd_context.verify(
        password[:72],
        hashed
    )


# ---------------- SCHEMAS ----------------

class RegisterData(BaseModel):
    email: EmailStr
    username: str
    password: str


class LoginData(BaseModel):
    email: EmailStr
    password: str


# ---------------- GOOGLE OAUTH ----------------

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID2")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET2")

print(f"ID: {GOOGLE_CLIENT_ID}")
print(f"Secret: {GOOGLE_CLIENT_SECRET}")


oauth = OAuth()

oauth.register(
    name="google",

    client_id=GOOGLE_CLIENT_ID,

    client_secret=GOOGLE_CLIENT_SECRET,

    server_metadata_url=
    "https://accounts.google.com/.well-known/openid-configuration",

    client_kwargs={
      "scope":"openid email profile"
    }
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ai-privacy-auditor.vercel.app")
BACKEND_URL = os.getenv("BACKEND_URL", "https://ai-privacy-auditor-1jse.vercel.app")
print(BACKEND_URL)


# @app.get("/auth/login/google")
# async def google_login(request: Request):
#     callback_uri = "https://ai-privacy-auditor-1jse.vercel.app/auth/google/callback"
#     redirect_uri = request.url_for("google_callback")

#     return await oauth.google.authorize_redirect(
#         request,
#         callback_uri
#     )
@app.get("/auth/login/google")
async def google_login(request: Request):
    # Маңызды: Ертеңгі көрсетілім үшін локальді сілтемені қалдыр
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # Мұнда да локальді callback көрсетілуі тиіс
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    try:
        token = await oauth.google.authorize_access_token(request, redirect_url=redirect_uri)    
    except Exception as exc:
        detail = str(exc)
        print("Google callback authorize_access_token failed:", detail)
        return {
            "error": "Google authorize_access_token failed",
            "detail": detail,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        }

    if not token or "userinfo" not in token:
        detail = f"Invalid token response: {token}"
        print(detail)
        return {
            "error": "Invalid token response",
            "detail": detail,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        }

    user_info = token["userinfo"]
    email = user_info.get("email")
    name = user_info.get("name", email.split("@")[0] if email else None)

    if not email:
        detail = f"Email not found in userinfo: {user_info}"
        print(detail)
        return {
            "error": "Email not found in userinfo",
            "detail": detail,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        }

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        user = User(
            email=email,
            username=name,
            password_hash=None
        )
        db.add(user)
        db.commit()

    if not FRONTEND_URL:
        raise HTTPException(
            status_code=500,
            detail="FRONTEND_URL environment variable is not set on the backend. Set it to your frontend URL."
        )

    if FRONTEND_URL.rstrip('/') == BACKEND_URL.rstrip('/'):
        raise HTTPException(
            status_code=500,
            detail="FRONTEND_URL is set to the backend URL. It must point to your frontend URL, not backend."
        )

    try:
        frontend_url = f"{FRONTEND_URL}/auth/google/callback?email={quote(email)}&name={quote(name)}"
        return RedirectResponse(url=frontend_url)
    except Exception as exc:
        detail = str(exc)
        print("Google callback redirect failed:", detail)
        return {
            "error": "RedirectResponse failed",
            "detail": detail,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        }
# @app.get("/auth/google/callback")
# async def google_callback(
#     request: Request,
#     db: Session = Depends(get_db)
# ):
#     callback_uri = "https://ai-privacy-auditor-1jse.vercel.app/auth/google/callback"    
#     try:
#         token = await oauth.google.authorize_access_token(request, redirect_url=callback_uri)
#     except Exception as exc:
#         detail = str(exc)
#         print("Google callback authorize_access_token failed:", detail)
#         return {
#             "error": "Google authorize_access_token failed",
#             "detail": detail,
#             "frontend_url": FRONTEND_URL,
#             "backend_url": BACKEND_URL
#         }

#     if not token or "userinfo" not in token:
#         detail = f"Invalid token response: {token}"
#         print(detail)
#         return {
#             "error": "Invalid token response",
#             "detail": detail,
#             "frontend_url": FRONTEND_URL,
#             "backend_url": BACKEND_URL
#         }

#     user_info = token["userinfo"]
#     email = user_info.get("email")
#     name = user_info.get("name", email.split("@")[0] if email else None)

#     if not email:
#         detail = f"Email not found in userinfo: {user_info}"
#         print(detail)
#         return {
#             "error": "Email not found in userinfo",
#             "detail": detail,
#             "frontend_url": FRONTEND_URL,
#             "backend_url": BACKEND_URL
#         }

#     user = db.query(User).filter(
#         User.email == email
#     ).first()

#     if not user:
#         user = User(
#             email=email,
#             username=name,
#             password_hash=None
#         )
#         db.add(user)
#         db.commit()

#     if not FRONTEND_URL:
#         raise HTTPException(
#             status_code=500,
#             detail="FRONTEND_URL environment variable is not set on the backend. Set it to your frontend URL."
#         )

#     if FRONTEND_URL.rstrip('/') == BACKEND_URL.rstrip('/'):
#         raise HTTPException(
#             status_code=500,
#             detail="FRONTEND_URL is set to the backend URL. It must point to your frontend URL, not backend."
#         )

#     try:
#         frontend_url = f"{FRONTEND_URL.rstrip('/')}/auth/google/callback?email={quote(email)}&name={quote(name)}"
#         return RedirectResponse(url=frontend_url, status_code=302)
#     except Exception as exc:
#         detail = str(exc)
#         print("Google callback redirect failed:", detail)
#         return {
#             "error": "RedirectResponse failed",
#             "detail": detail,
#             "frontend_url": FRONTEND_URL,
#             "backend_url": BACKEND_URL
#         }


# ---------------- REGISTER ----------------

@app.post("/register")
def register(
    data:RegisterData,
    db:Session=Depends(get_db)
):

    existing = db.query(User).filter(
        User.email==data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="User exists"
        )

    user = User(
        email=data.email,
        username=data.username,
        password_hash=
            hash_password(data.password)
    )

    db.add(user)
    db.commit()

    return {
       "message":"registered"
    }


# ---------------- LOGIN ----------------

@app.post("/login")
def login(
    data:LoginData,
    db:Session=Depends(get_db)
):

    user=db.query(User).filter(
        User.email==data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Wrong email"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    return {
   "message":"login success",
   "user": user.username,
   "access_token":"demo-token"
}


# ---------------- ROOT ----------------

@app.get("/")
def root():
    return {
      "status":"Consent OS running"
    }

@app.get("/api/test")
async def test_endpoint():
    return {"message": "Backend is working!", "status": "ok"}


GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Используем GROQ API Key для доступа к DeepSeek

@app.post("/api/analyze-privacy")
async def analyze_privacy(data: AnalysisRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API Key not configured")

    prompt = (
        f"Explain in simple words why the app '{data.serviceName}' "
        f"with permissions {', '.join(data.permissions)} might be a privacy risk. "
        f"Give a short, 2-sentence advice on whether to keep it."
    )

    # Эндпоинт DeepSeek (совместим с OpenAI)
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-oss-120b",  # Основная модель DeepSeek-V3
        "messages": [
            {
                "role": "system", 
                "content": "You are a helpful privacy assistant. Provide concise explanations in simple kazakh language."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ],
        "stream": False,
        "max_tokens": 512
    }

    async with httpx.AsyncClient() as client:
        try:
            # DeepSeek может быть загружен, поэтому ставим таймаут побольше
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                error_data = response.json()
                return {"error": f"Error: {error_data.get('error', {}).get('message', 'Unknown error')}"}
            
            result = response.json()
            
            # Извлекаем текст (структура такая же, как у OpenAI)
            explanation = result['choices'][0]['message']['content'].strip()
            return {"explanation": explanation}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# @app.get("/api/analyze-app/{app_id}")
# async def analyze_real_app(app_id: str):
#     try:
#         # 1. Получаем данные из Google Play (например, 'com.instagram.android')
#         info = get_app_info(app_id, lang='en', country='us')
        
#         app_name = info['title']
#         # Вытягиваем краткое описание или жанр для анализа
#         summary = info['summary'] or info['description'][:200]
        
#         # 2. Формируем промпт для Gemini
#         prompt = (
#             f"Act as a privacy expert. Analyze the app '{app_name}'. "
#             f"Context: {summary}. "
#             f"Based on its category and typical behavior, explain 3 main privacy risks "
#             f"in one short sentence each. Give a final safety score from 1 to 100."
#         )

#         # 3. Запрос к Gemini (используй свой существующий код с GEMINI_API_KEY)
#         url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
#         payload = {"contents": [{"parts": [{"text": prompt}]}]}
        
#         async with httpx.AsyncClient() as client:
#             resp = await client.post(url, json=payload)
#             ai_data = resp.json()
#             explanation = ai_data['candidates'][0]['content']['parts'][0]['text']

#         return {
#             "title": app_name,
#             "icon": info['icon'],
#             "score": info.get('score', 70), # или выпарси число из ответа AI
#             "ai_analysis": explanation
#         }
#     except Exception as e:
#         raise HTTPException(status_code=404, detail=f"App not found or error: {str(e)}")


@app.get("/api/analyze-app")
async def analyze_real_app(name: str):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="DeepSeek API Key not configured")

    prompt = (
        f"Жауап құрылымы (қатаң сақталсын):"
        f"{name} сервистің сипаттамасы: Қолданбаның негізгі қызметін 1 сөйлеммен түсіндір."
        f"Сұралатын рұқсаттар: Осы қолданба әдетте сұрайтын ең маңызды 3-5 рұқсатты тізіп шық (мысалы: Геолокация, Контактілер, Камера)."
        f"Қауіпсіздік симуляциясы: Егер қазіргі құпиялылық деңгейі (Privacy Score) 78% болса, осы сервисті қосқаннан кейін бұл көрсеткіш қанша пайызға төмендейтінін есепте."
        f"Егер сервис қауіпті болса (мысалы, TikTok, Instagram): -10% немесе одан көп."
        f"Егер сервис орташа қауіпті болса: -5% немесе -8%."
        f"Егер сервис қауіпсіз болса (мысалы, Signal): -1% немесе -2%."
        f"Қорытынды пайыз: Жаңа болжамды көрсеткішті көрсет (мысалы: 78% -> 72%)."
        f"Маңызды: Тек қана деректерге сүйеніп, қысқа жауап бер. Ешқандай артық сөз жазба. Тек қазақ тілінде жауап бер."
        f"Қосымша ақпарат: {name} қолданбасы туралы интернеттен табылған мәліметтерді пайдалана отырып, жоғарыдағы сұрақтарға жауап бер. Егер мәліметтер жеткіліксіз болса, ең ықтимал сценарийлерді болжа. "
    )

    # Эндпоинт DeepSeek (совместим с OpenAI)
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-oss-120b",  # Основная модель DeepSeek-V3
        "messages": [
            {
                "role": "system", 
                "content": "Role: Сен киберқауіпсіздік және деректер құпиялылығы бойынша сарапшысың. Пайдаланушы саған қолданбаның немесе сервистің атауын жазады, ал сен оған қысқа әрі нақты диагностика жасауың керек."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ],
        "stream": False,
        "max_tokens": 512
    }

    async with httpx.AsyncClient() as client:
        try:
            # DeepSeek может быть загружен, поэтому ставим таймаут побольше
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                error_data = response.json()
                return {"error": f"Error: {error_data.get('error', {}).get('message', 'Unknown error')}"}
            
            result = response.json()
            
            # Извлекаем текст (структура такая же, как у OpenAI)
            explanation = result['choices'][0]['message']['content'].strip()
            return {"explanation": explanation}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
        


@app.get("/api/ai-chat")
async def analyze_real_app(question: str):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="API Key not configured")

    # Consent OS туралы контекст (Резпозиторийдегі негізгі ақпаратты осы жерге жинақтап жазамыз)
    context = (
        "Сен — Consent OS жобасының ажырамас бөлігісің. Бұл жоба (AldyShap/ai-privacy-auditor) "
        "пайдаланушыларға қолданбалардың құпиялылық деңгейін түсіндіруге арналған. "
        "Жоба React (фронтенд) және FastAPI (бэкенд) арқылы жасалған. "
        "Сен тек қауіпсіздік емес, осы Consent OS жобасының мүмкіндіктері туралы да сұрақтарға жауап бересің."
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile", # Groq-та бұл модель тұрақты жұмыс істейді
        "messages": [
            {
                "role": "system", 
                "content": f"Role: {context} Пайдаланушының сұрақтарына қазақ тілінде, достық форматта (Жарвис ретінде) жауап бер."
            },
            {
                "role": "user", 
                "content": question # Пайдаланушының нақты сұрағы
            }
        ],
        "max_tokens": 800
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", 
                                       json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                return {"explanation": "Кешіріңіз, қазір жауап бере алмай тұрмын. Бэкендті тексеріңіз."}
            
            result = response.json()
            explanation = result['choices'][0]['message']['content'].strip()
            return {"explanation": explanation}
            
        except Exception as e:
            return {"error": str(e)}
