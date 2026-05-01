import React, { useState } from 'react';
import "./Modal.css";
import { getAIExplanation } from "../services/aiService.js";

const ServiceModal = ({ service, onClose, onRevoke }) => {
    const [aiDetail, setAiDetail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExplainMore = async () => {
        setLoading(true);
        const result = await getAIExplanation(service.name, service.data);
        setAiDetail(result);
        setLoading(false);
    };

    return (
        <div className="service-modal-overlay" onClick={onClose}>
            <div className="service-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="service-close-row">
                    <button className="service-card-close" onClick={onClose}>←</button>
                </div>

                <div className="modal-header">
                    <img src={service.img_src} alt={service.name} className="modal-logo" />
                    <div className="modal-header-info">
                        <h2>{service.name}</h2>
                        <p>Соңғы кіру: {service.lastAccess}</p>
                    </div>
                    <div className="risk-badge" style={{ backgroundColor: service.color }}>
                        {service.risk} ҚАУІП
                    </div>
                </div>

                <div className="ai-explain-box">
                    <h4>🤖 AI түсіндірмесі</h4>
                    <p>
                        Бұл сервис сіздің <b>орналасқан жеріңізді</b> және <b>хабарламаларыңызды</b> бақылайды.
                        Деректер жарнамалық серіктестермен бөлісуі мүмкін.
                    </p>
                </div>

                <div className="permissions-list">
                    <h4>Қол жеткізілген деректер:</h4>
                    {service.data.map((item) => (
                        <div key={item} className="perm-item">
                            <span>{item}</span>
                            <div className="perm-status-icon">✓</div>
                        </div>
                    ))}
                </div>

                {aiDetail && (
                    <div className="ai-analysis-result">
                        <h4>🔍 Толық талдау:</h4>
                        <p>{aiDetail}</p>
                    </div>
                )}

                <div className="button-group">
                    <button className="revoke-btn" onClick={onRevoke}>
                        ✕ РҰҚСАТТЫ ҚАЙТАРЫП АЛУ
                    </button>
                    <button
                        className="explain-btn"
                        onClick={handleExplainMore}
                        disabled={loading}
                    >
                        {loading ? "Талдау..." : "ТОЛЫҒЫРАҚ ТҮСІНДІРУ"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;