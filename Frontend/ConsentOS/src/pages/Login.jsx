import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
// import.meta.env.VITE_API_URL || 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API_URL = "https://ai-privacy-auditor.onrender.com";

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Пайдаланушы мен токенді сақтау
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({
          username: data.user, // Бэкэндтен келген аты
          email: email
        }));

        alert("Қош келдіңіз!");
        
        // 2. Dashboard-қа өту
        navigate("/dashboard"); 

      } else {
        alert(`${data.detail} or password` || "Қате орын алды");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Сервер қатесі. Бэкэнд қосулы екенін тексеріңіз.");
    }
  }

  return (
    <div className="container">
      <div className="registration-card login-card">
        <div className="form-section">
          <div className="logo">
            <img src="/contendOs.png" alt="Logo" className="contendOs-logo" />
          </div>

          <h1>Қош келдіңіз!</h1>
          <p className="subtitle">Аккаунтыңызға кіріңіз</p>

          <a className="google-btn" href={`${API_URL}/auth/login/google`}>
            <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: "18px", marginRight: "10px" }} />
            Google арқылы кіру
          </a>

          <div className="divider">немесе</div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Құпия сөз</label>
                <a href="#" className="forgot-link">Ұмыттыңыз ба?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="submit-btn" type="submit">Кіру</button>
          </form>

          <p className="footer-text">
            Аккаунтыңыз жоқ па? <Link to="/signup" className="link-text">Тіркелу</Link>
          </p>
        </div>

        <div className="info-section welcome-back">
          <div className="welcome-content">
            <h2>Қауіпсіздік — біздің басты мақсатымыз</h2>
            <p>Деректеріңізді бақылауда ұстаңыз және құпиялылықты сақтаңыз.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;