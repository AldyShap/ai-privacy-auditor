import React, { useState, useEffect } from 'react'; // useEffect қосылды
import { useNavigate } from 'react-router-dom'; // useNavigate қосылды
import { mockServices as initialData } from '../data/mockData.js';
import { calculateScore } from '../utils/calculateScore';
import ScoreCircle from '../components/ScoreCircle';
import ServiceModal from '../components/ServiceCard.jsx';
import "./Dashboard.css"

const Dashboard = () => {
    const [services, setServices] = useState(initialData);
    const [selectedService, setSelectedService] = useState(null);
    const [userName] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return "Пайдаланушы";
        const userObj = JSON.parse(savedUser);
        return userObj.username || userObj.name || "Пайдаланушы";
    });
    const navigate = useNavigate();
    
    const score = calculateScore(services);

    const groupedServices = services.reduce((groups, service) => {
    if (!groups[service.category]) {
    groups[service.category] = [];
    }

    groups[service.category].push(service);
    return groups;

    }, {})

    // --- LOCALSTORAGE ИНТЕГРАЦИЯСЫ ---
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear(); // Деректерді тазалау
        navigate("/login");
    };
    // --------------------------------

    const handleRevoke = (id) => {
        setServices(services.filter(s => s.id !== id));
        setSelectedService(null);
    };

    const openManage = (service) => {
        setSelectedService(service);
    };

    const closeManage = () => {
        setSelectedService(null);
    };

    return (
        <div className="dashboard-layout">
            {/* Сол жақ панель */}
            <div className="left-panel">
                {/* Пайдаланушы аты мен шығу батырмасы (дизайнға қосымша) */}
                <div style={{marginBottom: '20px', textAlign: 'center'}}>
                    <h2 style={{fontSize: '25px', fontFamily: "sans-serif"}}>Сәлем, {userName}!</h2>
                    <button onClick={handleLogout} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '12px', fontFamily: "sans-serif"}}>Шығу</button>
                </div>

                <ScoreCircle score={score} />
                <div className="score-desc">
                </div>
                <div class="notifications-container">
  <h2 class="section-title">Хабарландырулар</h2>
  
  <div class="cards-wrapper">
    <div class="notification-card">
      <div class="icon-box">
        <span class="icon">!</span>
      </div>
      <div class="content">
        <div class="app-name">Flashlight App</div>
        <div class="status-text">
          <span class="bold">КРИТИКАЛЫҚ РҰҚСАТ:</span> Контактілер
        </div>
      </div>
    </div>

    <div class="notification-card">
      <div class="icon-box">
        <span class="icon">🔊</span>
      </div>
      <div class="content">
        <div class="app-name">SocialNet</div>
        <div class="status-text">
          <span class="bold">ОРТАША ҚАУІП:</span> Фондық аудио
        </div>
      </div>
    </div>
  </div>
</div>
            </div>

            {/* Оң жақ панель */}
            <div className="right-panel" style={{backgroundColor: "white"}}>

            <h3 className="connect-count">
                Connected services ({services.length})
            </h3>

            {Object.entries(groupedServices).map(([category, items]) => (
            <div key={category} className="category-block">

                <h3 className="category-title" style={{fontFamily: "sans-serif"}}>
                {category} ({items.length})
                </h3>

                <div className="services-grid">

                {items.map(s => (
                <div className="service" key={s.id}>

                    <div className="service-main">

                    <div className="image-container">
                        <img src={s.img_src} alt={s.name} style={{width:70,height:70}} />
                    </div>

                    <div className="contend">
                        <p style={{
            fontFamily:"sans-serif",
            fontSize:16,
            fontWeight:"bold"
            }}>
                        {s.name}
                        </p>

                        <p className="last-access">
                        Last access: {new Date().getDate()}/{new Date().getMonth()+1}
                        </p>

                    </div>
                    </div>

                    <div className="change-stats">

                    <p className="risk-badge" style={{
            backgroundColor:s.color,
            borderRadius:10,
            width:50,
            height:20,
            textAlign:"center",
            alignContent:"center",
            color:"white",
            fontSize:15,
            fontWeight:"bold",
            fontFamily:"sans-serif"
            }}>{s.risk}</p>

                    <button className="manage-btn" onClick={()=> openManage(s)}>
                        Manage
                    </button>

                    </div>

                </div>
                ))}

                </div>
            </div>
            ))}

            </div>

            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    onClose={closeManage}
                    onRevoke={() => handleRevoke(selectedService.id)}
                />
            )}
        </div>
    );
};

export default Dashboard;