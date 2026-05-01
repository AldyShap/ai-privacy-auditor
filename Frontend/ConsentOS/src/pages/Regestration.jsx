import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Regestration.css';
import { API_URL } from '../services/config.js';


const RegistrationPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Тіркелу сәтті аяқталды!");
        navigate("/login"); // Логин бетіне жіберу
      } else {
        alert(data.detail || "Тіркелу кезінде қате шықты");
      }
    } catch (error) {
      console.error(error);
      alert("Сервермен байланыс жоқ");
    }
  }

  return (
    <div className="container">
      <div className="registration-card">
        <div className="form-section">
          <div className="logo">
            <img src="/contendOs.png" className='contendOS-logo' alt="logo" />
          </div>

          <h1 style={{ textAlign: "center", marginBottom: "0" }}>Аккаунт жасаңыз</h1>
          <p className="subtitle">Барлық рұқсаттарды бір жерден басқарыңыз</p>
          
          {/* Google батырмасы енді функцияны шақырады */}
          <a
            className="google-btn"
            href={`${API_URL}/auth/login/google`}
            style={{ backgroundColor: "white", padding: 0, margin: "10px 0", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "center", width: "100%", textDecoration: "none"}}
          >
            <img src="/google_reg.png" style={{ width: 250, borderRadius: 20 }} alt="google" />
          </a>
          
          <div className="divider" style={{ textAlign: "center", margin: "15px 0", color: "#aaa" }}>НЕМЕСЕ</div> 

          <form onSubmit={handleSubmit}>
            <label>Аты-жөні</label>
            <input 
              type="text" 
              className='name' 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            
            <label>Email</label>
            <input 
              type="email" 
              className='email' 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            
            <label>Құпия сөз</label>
            <input 
              type="password" 
              className='password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            <button className="submit-btn" type="submit">Тіркелу</button>
          </form>

          <p style={{ marginTop: "15px", textAlign: "center" }}>
            Аккаунтыңыз бар ма? <Link to="/login" style={{ color: "blue", fontWeight: "bold", textDecoration: "none" }}>кіру</Link>
          </p>
        </div>

        <div className="info-section">
          <div className="score-card" style={{ textAlign: "center" }}>
            <img src="/score.png" style={{ width: "100%", maxWidth: 350, borderRadius: 15 }} alt="score" />
          </div>
          <div className="info-cards">
            <div className="card">Толық бақылау өз қолыңызда</div>
            <div className="card blue">AI түсіндіреді</div>
            <div className="card orange">Қауіпті алдын ала көреді</div>
            <div className="card green">Бір батырмамен басқару</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;