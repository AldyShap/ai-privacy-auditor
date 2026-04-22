import React, { useState } from 'react'; // 1. useState импорттау
import { getAIExplanation } from '../services/aiService'; // AI функциясы
import "./Modal.css";

const ServiceModal = ({ service, onClose, onRevoke }) => {
    // 2. State-терді анықтау
    const [aiDetail, setAiDetail] = useState(""); // AI-дың толық жауабы
    const [loading, setLoading] = useState(false); // Жүктелу анимациясы

    const handleExplainMore = async () => {
        setAiDetail(""); // Ескі жауапты өшіру
        setLoading(true); // "Ойланып жатыр..." режимін қосу

        // AI-дан жауап алу (fetch)
        const explanation = await getAIExplanation(service.name, service.data);

        setAiDetail(explanation); // Жаңа жауапты сақтау
        setLoading(false); // Жүктелуді тоқтату
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* ... Модальдің басы (бұрынғыша) ... */}
                <button onClick={onClose} className="service-card-close">🔙</button>
                <h2>{service.name} Management</h2>

                <div className="ai-explain-box">
                    🤖 AI: This service has access to your sensitive data.
                </div>

                {/* БАТЫРМАЛАР БӨЛІМІ */}
                <div className="button-service">
                    <button className="revoke-btn" onClick={onRevoke}>Revoke Access</button>

                    <button
                        className="explain-btn"
                        onClick={handleExplainMore}
                        disabled={loading} // Жүктеліп жатқанда батырма басылмайды
                    >
                        {loading ? "Thinking..." : "Explain More 🔎"}
                    </button>
                </div>

                {/* 3. ОТОБРАЖАТЬ ЕТУ (ШАРТТЫ РЕНДЕР) */}
                {/* Егер aiDetail бос болмаса, тек сонда ғана бұл блок көрінеді */}
                {aiDetail && (
                    <div className="ai-detail-result">
                        <h4>Detailed Analysis:</h4>
                        <p>{aiDetail}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceModal;