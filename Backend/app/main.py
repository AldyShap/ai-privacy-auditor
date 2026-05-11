from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
import httpx
import json

from datetime import datetime, timezone # This allows using datetime.now()
from sqlalchemy import JSON, ForeignKey, Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from google_play_scraper import app as get_app_info, search
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    ForeignKey,
    func,
    JSON,
    select,
    delete,
    and_
)

from sqlalchemy.orm import DeclarativeBase

from sqlalchemy.orm import (
    sessionmaker,
    Session,
    Mapped, 
    mapped_column
)

import enum

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
load_dotenv(os.path.join(BASE_DIR, ".env"))


# ---------------- APP ----------------

app = FastAPI(title="AI Privacy Auditor")


# ---------------- SESSION ----------------

app.add_middleware(
    SessionMiddleware,
    secret_key="supersecret123", # .env-ге салған дұрыс
    https_only=False,            # Локальді HTTP үшін міндетті түрде False
    same_site="lax",             # Google-ден қайтқанда сессияны жоғалтпау үшін
    session_cookie="session",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
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

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    # id must have the : Mapped[int] type hint
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    username: Mapped[str] = mapped_column(nullable=True)
    password_hash: Mapped[str] = mapped_column(nullable=True)

class Risk(enum.Enum):
    low = "LOW"
    medium = "MEDIUM"
    high = "HIGH"

class Color(enum.Enum):
    low = "#10b981"
    medium = "#f59e0b"
    high = "#ef4444"

# 3. Updated ConnectedService Model
class ConnectedService(Base):
    __tablename__ = "connected_services"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column()
    
    color: Mapped[Color] = mapped_column()
    category: Mapped[str] = mapped_column()
    risk: Mapped[Risk] = mapped_column()
    img_src: Mapped[str] = mapped_column()
    
    # datetime.datetime емес, жай ғана datetime деп жаз (өйткені жоғарыда солай импортталды)
    lastAccess: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    data: Mapped[list[str]] = mapped_column(JSON)

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

class ConnectedServiceSchema(BaseModel):
    name: str
    category: str
    risk: Risk
    color: Color
    img_src: str
    data: list[str]




# ---------------- GOOGLE OAUTH ----------------

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

print("Google Client ID: ", GOOGLE_CLIENT_ID)

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

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

@app.get("/auth/login/google")
async def google_login(request: Request):
    redirect_uri = "http://127.0.0.1:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@app.get("/auth/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    redirect_uri = "http://127.0.0.1:8000/auth/google/callback"
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
        frontend_url = f"{FRONTEND_URL.rstrip('/')}/auth/google/callback?email={quote(email)}&name={quote(name)}"
        return RedirectResponse(url=frontend_url, status_code=302)
    except Exception as exc:
        detail = str(exc)
        print("Google callback redirect failed:", detail)
        return {
            "error": "RedirectResponse failed",
            "detail": detail,
            "frontend_url": FRONTEND_URL,
            "backend_url": BACKEND_URL
        }


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
 

@app.post("/set-services")
def set_mock_services(
    services: list[ConnectedServiceSchema],
    username: str,
    db: Session = Depends(get_db)
):
    user_query = select(User).where(User.username == username)

    result = db.execute(user_query).scalar()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="The user not found in Database"
        )
    print(result.id)

    for service in services:
        # Create the model instance
        # Ensure we are only passing data that the DB model expects
        new_service = ConnectedService(
            **service.model_dump(exclude={"lastAccess"}), # Explicitly exclude the date if it's in the schema
            user_id=result.id
        )
        db.add(new_service)
    
    db.commit()
    return {"message": "OKAY"}

@app.get("/services")
async def get_services_of_user(
    username: str,
    db: Session = Depends(get_db)
):
    # 1. Пайдаланушыны табу
    user_query = select(User).where(User.username == username)
    user = db.execute(user_query).scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user not found in Database"
        )

    # 2. Тек осы пайдаланушыға тиісті сервистерді алу
    # .join() бұл жерде міндетті емес, өйткені бізде user.id бар
    services_query = select(ConnectedService).where(ConnectedService.user_id == user.id)
    
    result = db.execute(services_query)
    services_res = result.scalars().all()

    # 3. Нәтижені қайтару
    return {
        "success": True,
        "services": services_res  # Егер Pydantic қолдансаң, автоматты түрде өтеді
    }

@app.delete("/delete-service")
def delete_the_service(
    username: str,
    service_id: int,
    db: Session = Depends(get_db)
):
    user_query = select(User).where(User.username == username)

    result = db.execute(user_query).scalar()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Service not found or doesn't belong to this user"
        )
    
    user_id = result.id
    
    service_delete = (
        delete(ConnectedService)
        .where(
            and_(
                ConnectedService.id == service_id,
                ConnectedService.user_id == user_id)
        )
    )

    result = db.execute(service_delete)

    if result.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Service not found or doesn't belong to this user"
        )

    db.commit()

    return {
        "status": "success",
        "message": f"Service {service_id} deleted successfully"
    }


@app.post("/set-analyzed-app")
async def set_analyzed_app_ai(
    service_name: str,
    username: str, # Қай пайдаланушыға қосатынымызды білу үшін
    db: Session = Depends(get_db)
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="API Key not configured")

    # 1. Пайдаланушыны базадан табу
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. ИИ-ге арналған нұсқаулық (System Prompt)
    # Біз ИИ-ден ТЕК JSON қайтаруды талап етеміз
    instruction = (
        "Сен Privacy Auditor-сың. Берілген қолданбаны талдап, ТЕК қана келесі құрылымдағы JSON қайтар: "
        '{"name": "...", "category": "Education/Goverment/Daily Apps/Social Media/Finance/т.б", "risk": "high/medium/low", "color": "low/medium/high",'
        '"img_src": "URL/Path", "data": ["item1", "item2", "Geolocation", "Contacts", "Т.б"]}. '
        "Ешқандай артық мәтін жазба, тек JSON."
    )

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": instruction},
            {"role": "user", "content": f"Analyze this app: {service_name}"}
        ],
        "response_format": {"type": "json_object"} # Модельге JSON қайтаруды бұйырамыз
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", 
                                       json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="AI Service unavailable")

            ai_data = response.json()['choices'][0]['message']['content']
            app_info = json.loads(ai_data) # Стрингті Python dict-ке айналдыру

            existing_service = db.query(ConnectedService).filter(
                ConnectedService.name == app_info['name'],
                ConnectedService.user_id == user.id
            ).first()

            if existing_service:
                return {"message": "Бұл сервис сізде қосылған!", "added_app": app_info}

            # 3. Базаға сақтау
            new_service = ConnectedService(
                user_id=user.id,
                name=app_info['name'],
                color=app_info['color'],
                category=app_info['category'],
                risk=app_info['risk'],
                img_src=app_info.get('img_src', '/default.png'),
                data=app_info.get("data", ["No data"])
                # 'data' бағаны сенде JSON болса, оны тікелей салуға болады
            )
            
            db.add(new_service)
            db.commit()
            db.refresh(new_service)

            return {"message": "Сервис сәтті орнатылды", "added_app": app_info}

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Error analyzing app: {str(e)}")