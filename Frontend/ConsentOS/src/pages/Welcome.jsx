import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Welcome.css";

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-wrapper" >
            {/* 1. HERO SECTION */}
            <header className="hero-section">
                <h1 className="main-title">Қандай қолданбаларды қадағалайтынын біліңіз <br/> сіз және оларды бір түймемен өшіріңіз</h1>
                <p className="main-subtitle">
                    Ai-сандық қол жетімділікті талдау, тәуекелдерді бағалау және өшіру жүйесі<br/>
                    бір рет басу арқылы қауіпті рұқсаттар.
                </p>
                <button className="cta-button" onClick={() => navigate('/login')}>
                    Тегін бастаңыз
                </button>

                <div className="hero-preview">
                    {/* ФОТО: Ортадағы Score 78 скриншоты */}
                    <img src={"/hero-dashboard.png"} alt="Privacy Score Preview" />
                </div>
            </header>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>


            {/* 2. AUDITOR PROMO SECTION */}
            <section className="promo-section">
                <div className="promo-container">
                    {/* ФОТО: AI-Privacy Auditor суреті (ортадағы үлкен блок) */}
                    <img src={"/auditor-main.jpg"} alt="AI Privacy Auditor" />
                </div>
            </section>

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            {/* 3. STEPS SECTION (1-2-3 Қадамдар) */}
            <section className="steps-row">
                {/* ФОТО: Шаг 1 карточкасы (дайын сурет) */}
                <img src={"/step123-card.png"} alt="Step 1" className="step-img" />


                {/* ФОТО: Шаг 3 карточкасы (дайын сурет) */}
            </section>

            {/* 4. WHY IT MATTERS (Боли и Доверие) */}
            <section className="trust-section">
                <div className="trust-container">
                    {/* ФОТО: "Почему это важно?" және "Нам можно доверять" екі блогы бірге немесе жеке */}
                    <img src={"/trust-block.png"} alt="Why it matters" />
                </div>
            </section>

            {/* 5. FOOTER */}
            <footer className="welcome-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={"src/assets/contendOs.png"} alt="ContendOSLogo" style={{width: 150, height: 50}}/>
                        <p>Твой личный щит в мире цифровых данных.</p>
                    </div>
                    <div className="footer-contacts">
                        <p>Support: venom.albol.8@gmail.com</p>
                        <p>8 778 185 91 83</p>
                        <p>Astana, Kazakhstan</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;