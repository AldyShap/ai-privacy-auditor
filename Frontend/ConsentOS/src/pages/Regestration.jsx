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

    // API_URL соңында артық / болмауын қадағалаймыз
    const cleanURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    try {
      const response = await fetch(`${cleanURL}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          email: email.trim(), 
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Тіркелу сәтті аяқталды!");
        navigate("/login");
      } else {
        // Егер базада юзер бар болса, соны көрсетеді
        alert(data.detail || "Қате: Мұндай қолданушы бар болуы мүмкін");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Егер бэкенд мүлдем өлсе, презентацияны құтқару үшін:
      alert("Бэкендке запрос кетпеді. Байланысты тексеріңіз.");
    }
  }

  return (
    <div className="container">
      <div className="registration-card">
        <div className="form-section">
          <div className="logo">
            <img src="/contendOs.png" className='contendOS-logo' alt="logo" />
          </div>

          <h1 style={{ textAlign: "center" }}>Тіркелу</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Аты-жөні</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Құпия сөз</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <button className="submit-btn" type="submit">Есептік жазба жасау</button>
          </form>

          <p style={{ marginTop: "15px", textAlign: "center" }}>
            Аккаунтыңыз бар ма? <Link to="/login" style={{ color: "blue", textDecoration: "none" }}>Кіру</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;