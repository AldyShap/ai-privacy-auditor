import React, { useState } from 'react';
import { calculateScore } from '../utils/calculateScore';
import { mockServices } from '../data/mockData'; // Бастапқы деректер
import ScoreCircle from '../components/ScoreCircle';
import "./Simulation.css";

const Simulation = () => {
    // 1. Сервистерді бақылау үшін state қосамыз
    const [localServices, setLocalServices] = useState(mockServices);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Қазіргі ұпай енді localServices негізінде есептеледі
    const currentScore = calculateScore(localServices);

    const appsToSimulate = [
        { id: 101, name: "New Social App", risk: "high", data: ["Contacts", "Location"], color: "#ef4444", img_src: "src/assets/youtube.png", lastAccess: `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`},
        { id: 102, name: "Health Tracker", risk: "medium", data: ["Biometrics"], color: "#f59e0b", img_src: "src/assets/youtube.png", lastAccess: `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`},
        { id: 103, name: "Weather Pro", risk: "low", data: ["Location"], color: "#10b981", img_src: "src/assets/youtube.png", lastAccess: `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`},
    ];

    // 2. Сервисті қосу функциясы
    const handleAllowAnyway = () => {
        if (selectedApp) {
            // Тізімге жаңа сервисті қосамыз
            setLocalServices([...localServices, selectedApp]);
            setShowModal(false);
            setSelectedApp(null);
            alert(`${selectedApp.name} сәтті қосылды!`);
        }
    };

    const handleSimulate = (app) => {
        setSelectedApp(app);
        setShowModal(true);
    };

    const getRiskReasons = (app) => {
        const reasons = [];
        if (app.data.includes("Contacts")) reasons.push("Access to contacts");
        if (app.data.includes("Location")) reasons.push("Always-on geolocation");
        if (app.risk === "high") reasons.push("High risk of data leak");
        return reasons;
    };

    const predictedScore = selectedApp
        ? calculateScore([...localServices, selectedApp])
        : currentScore;

    return (
        <div className="sim-container">
            <div className="sim-header">
                <h1 style={{fontSize: 30, textAlign: "center", fontFamily: "sans-serif", }}>📝Privacy Simulator</h1>
                <p style={{fontSize: 20}}>⚠️Бағдарламаны орнатпас бұрын тәуекелдерді тексеріңіз</p>
                <hr/>
            </div>

            <div className="sim-content">
                {/* Сол жақ: Салыстыру */}
                <div className="sim-visual">
                    <div className="score-compare">
                        <div className="score-box">
                            <span>Current</span>
                            <h2 style={{color: '#94a3b8'}}>{currentScore}</h2>
                        </div>
                        <div className="score-arrow">➜</div>
                        <div className="score-box">
                            <span>Predicted</span>
                            <h2 style={{color: selectedApp ? '#3b82f6' : '#94a3b8'}}>
                                {predictedScore}
                            </h2>
                        </div>
                    </div>
                    {/* Біздің ScoreCircle-ді осында көрсетуге болады */}
                    <ScoreCircle score={predictedScore} />
                </div>

                {/* Оң жақ: Таңдау */}
                <div className="sim-apps">
                    <h3>Select App to Simulate</h3>
                    {appsToSimulate.map(app => (
                        <div
                            key={app.id}
                            className={`sim-card ${selectedApp?.id === app.id ? 'active' : ''}`}
                            onClick={() => handleSimulate(app)}
                        >
                            <h4>{app.name}</h4>
                            <p>Risk: {app.risk}</p>
                        </div>
                    ))}

                    {selectedApp && (
                        <div className="sim-result-box">
                            <h4>AI Prediction:</h4>
                            <p>Installing <b>{selectedApp.name}</b> will decrease your privacy by
                                <span className="drop-value"> {currentScore - predictedScore} points</span>.
                            </p>
                            <button className="install-btn">Proceed with Caution</button>
                        </div>
                    )}
                    {showModal && selectedApp && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>⚠️ Simulation: {selectedApp.name}</h2>
                                <hr/>

                                <div className="modal-scores">
                                    <div>
                                        <p style={{fontSize: 20, fontFamily: "sans-serif"}}>Old</p>
                                        <h2 style={{fontSize: 50, fontFamily: "sans-serif"}}>{currentScore}</h2>
                                    </div>
                                    <div style={{fontSize: 100}}>→</div>
                                    <div>
                                        <p style={{fontSize: 20, fontFamily: "sans-serif"}}>New</p>
                                        <h2 style={{color: "red", fontSize: 50, fontFamily: "sans-serif"}}>{predictedScore}</h2>
                                    </div>
                                </div>


                                <h4>Why your score will drop:</h4>

                                <ol>
                                    {getRiskReasons(selectedApp).map((r, i) => (
                                        <li key={i} style={{fontSize: 20, fontFamily: "sans-serif", fontWeight: "bold"}}>⚠️ {r}</li>
                                    ))}
                                </ol>
                                <hr/>


                                <div className="modal-actions">
                                    <button style={{height: 30, fontSize: 20, border: "none", backgroundColor: "#0d87da", color: "white", borderRadius: 5}} onClick={() => setShowModal(false)}>
                                        Decline & Disconnect
                                    </button>
                                    <button
                                        style={{height: 40, fontSize: 18, border: "none", backgroundColor: "#ef4444", color: "white", borderRadius: 5, cursor: "pointer", marginLeft: 10}}
                                        onClick={handleAllowAnyway}
                                    >
                                        Allow Anyway
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulation;