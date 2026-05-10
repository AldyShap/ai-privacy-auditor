import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateScore } from '../utils/calculateScore';
import ScoreCircle from '../components/ScoreCircle';
import ServiceModal from '../components/ServiceCard.jsx';
import { ToastContainer, toast } from 'react-toastify';

// Стилдерді импорттау
import 'react-toastify/dist/ReactToastify.css'; 
import "./Dashboard.css";

const Dashboard = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const navigate = useNavigate();

    // Пайдаланушы атын localStorage-тен алу
    const [userName] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return "Пайдаланушы";
        const userObj = JSON.parse(savedUser);
        return userObj.username || userObj.name || "Пайдаланушы";
    });

    // 1. Деректерді Бэкендтен алу
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
            navigate("/login");
            return;
        }

        const fetchServices = async () => {
            try {
                const userObj = JSON.parse(savedUser);
                const username = userObj.username; 

                const response = await fetch(`http://127.0.0.1:8000/services?username=${username}`);
                
                if (!response.ok) {
                    throw new Error("Серверден дерек алу мүмкін болмады");
                }

                const data = await response.json();
                setServices(data.services || []); 
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Деректерді жүктеу қатесі!");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [navigate]);

    // 2. Рұқсатты қайтарып алу (Өшіру)
    const handleRevoke = async (id) => {
        // Optimistic Update: Бірден экраннан өшіру
        const previousServices = [...services];
        const updatedServices = services.filter(s => s.id !== id);
        setServices(updatedServices);
        setSelectedService(null);

        try {
            const savedUser = localStorage.getItem("user");
            const userObj = JSON.parse(savedUser);

            const response = await fetch(
                `http://127.0.0.1:8000/delete-service?username=${userObj.username}&service_id=${id}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Delete failed");

            toast.success("Рұқсат сәтті қайтарылды!");
        } catch (error) {
            console.error("Revoke error:", error);
            toast.error("Серверде өшіру кезінде қате шықты");
            setServices(previousServices); // Қате болса, деректерді қайтару
        }
    };


    // Есептеулер
    const score = calculateScore(services);
    
    const groupedServices = services.reduce((groups, service) => {
        const category = service.category || "Other";
        if (!groups[category]) groups[category] = [];
        groups[category].push(service);
        return groups;
    }, {});

    const openManage = (service) => setSelectedService(service);
    const closeManage = () => setSelectedService(null);

    // Жүктелу экраны
    if (loading) {
        return <div className="loading-screen">Жүктелуде...</div>;
    }

    return (
        <div className="dashboard-layout">
            {/* Тост хабарламалар контейнері */}
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Сол жақ панель */}
            <div className="left-panel">
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '25px', fontFamily: "sans-serif" }}>
                        Сәлем, {userName}!
                    </h2>
                    
                </div>

                <ScoreCircle score={score} />
                
                <div className="notifications-container">
                    <h2 className="section-title">Хабарландырулар</h2>
                    <div className="cards-wrapper">
                        <div className="notification-card critical">
                            <div className="icon-box">!</div>
                            <div className="content">
                                <div className="app-name">Flashlight App</div>
                                <div className="status-text"><b>КРИТИКАЛЫҚ:</b> Контактілер</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Оң жақ панель */}
            <div className="right-panel" style={{backgroundColor: "white"}}>
                <h3 className="connect-count">
                    {services.length > 0 ? `Connected services (${services.length})` : "No connected services"}
                </h3>

                {Object.entries(groupedServices).map(([category, items]) => (
                    <div key={category} className="category-block">
                        <h3 className="category-title">{category} ({items.length})</h3>
                        <div className="services-grid">
                            {items.map(s => (
                                <div className="service" key={s.id}>
                                    <div className="service-main">
                                        <div className="image-container">
                                            <img src={s.img_src} alt={s.name} />
                                        </div>
                                        <div className="contend">
                                            <p className="service-name">{s.name}</p>
                                            <p className="last-access">
                                                Last access: {new Date().getDate()}/{new Date().getMonth() + 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="change-stats">
                                        <p className="risk-badge" style={{ backgroundColor: s.color, fontFamily: "sans-serif"}}>
                                            {s.risk}
                                        </p>
                                        <button className="manage-btn" onClick={() => openManage(s)}>
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
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