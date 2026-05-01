import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  // БҰЛ — СЕНІҢ ҚҰТҚАРУШЫ ФУНКЦИЯҢ
  const handleFastLogin = (e) => {
    if (e) e.preventDefault();
    
    // 1. Өзіңе керек деректерді қолмен жазамыз
    const mockUser = {
      username: "Aldiyar Akbar", 
      email: "aldiyar@consent.os"
    };
    
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", "emergency_bypass_token");

    // 2. Dashboard-қа бірден ұшамыз
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="registration-card login-card">
        <div className="form-section">
          <div className="logo">
            <img src="/contendOs.png" alt="Logo" className="contendOs-logo" />
          </div>

          <h1>Consent OS</h1>
          <p className="subtitle">Жүйеге кіру (Demo Mode)</p>

          {/* ОСЫ БАТЫРМА ЕНДІ 100% ЖҰМЫС ІСТЕЙДІ */}
          <button className="google-btn" onClick={handleFastLogin} style={{ cursor: 'pointer' }}>
            <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: "18px", marginRight: "10px" }} />
            Google арқылы кіру (Bypass)
          </button>

          <div className="divider">немесе</div>

          <form onSubmit={handleFastLogin}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="admin@example.com" />
            </div>
            <div className="input-group">
              <label>Құпия сөз</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="submit-btn" type="submit">Кіру</button>
          </form>

          <p className="footer-text">
            Аккаунтыңыз жоқ па? <Link to="/signup" className="link-text">Тіркелу</Link>
          </p>
        </div>

        <div className="info-section welcome-back">
          <div className="welcome-content">
            <h2>Қауіпсіздік — біздің мақсат</h2>
            <p>Презентацияға дайындық режимі қосулы.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;