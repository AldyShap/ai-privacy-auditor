import React, { useState } from 'react';
import { mockServices as initialData } from '../data/mockData.js';
import { calculateScore } from '../utils/calculateScore';
import ScoreCircle from '../components/ScoreCircle';
import ServiceModal from '../components/ServiceCard.jsx';
import "./Dashboard.css"

const Dashboard = () => {
    // export-ты алып тастадық, себебі бұл ішкі айнымалылар
    const [services, setServices] = useState(initialData);
    const [selectedService, setSelectedService] = useState(null);
    const score = calculateScore(services);

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
            <div className="left-panel">
                <ScoreCircle score={score} />
                <div className="score-desc">
                     <p style={{color: '#64748b'}}>Lower risk is safer</p>
                </div>
            </div>

            <div className="right-panel">
                <h3 className="connect-count">Connected services ({services.length})</h3>
                <div className="services-container">
                    {services.map(s =>
                        <div className="service" key={s.id}>
                            <div className="service-main">
                                <div className="image-container">
                                    <img src={s.img_src} alt={s.name} style={{width: 70, height: 70}}/>
                                </div>
                                <div className="contend">
                                    <p className="contend-info" style={{fontFamily: "sans-serif", fontSize: 16, fontWeight: "bold"}}>{s.name}</p>
                                    <p className="last-access">Last access: {new Date().getDate()}/{new Date().getMonth()}</p>
                                </div>
                            </div>
                            <div className="change-stats">
                                <p className="risk-badge" style={{backgroundColor: s.color, borderRadius: 5, width: 70, height: 30, textAlign: "center", alignContent: "center", color: "white", fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif"}}>{s.risk || null}</p>
                                <button className="manage-btn" onClick={() => openManage(s)}>Manage</button>
                            </div>
                        </div>
                    )}
                </div>
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