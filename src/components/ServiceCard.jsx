import React from 'react';
import "./Modal.css";
import {useState} from "react";
import {getAIExplanationTest} from "../services/aiService.js";

// onRevoke — Dashboard-тан келетін функция
const ServiceModal = ({ service, onClose, onRevoke }) => {
        const [aiDetail, setAiDetail] = useState("");
        const [loading, setLoading] = useState(false);

        const handleExplainMore = async () => {
            setLoading(true);
            const result = await getAIExplanationTest(service.name, service.data); // try with gemini API
            setAiDetail(result);
            setLoading(false);
        };
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{justifyContent: "center"}}>
                    <button onClick={onClose} className="service-card-close" style={{width: 80, height: 30, textAlign: "center", alignItems: "center", border: "none", }}>←</button>
                </div>
                <br/>
                <div className="modal-header" style={{display: "flex", gap: 30}}>
                    <img src={service.img_src} alt={service.name} className="modal-logo" style={{width: 70, height: 70}}/>
                    <div className="modal-header-info">
                        <h2>{service.name}</h2>
                        <p>Last access: {service.lastAccess}</p>
                    </div>
                    <div>
                        <p style={{borderRadius: 7, border: "none", backgroundColor: service.color, color: "white", textAlign: "center", padding: 8, fontSize: 12, fontWeight: "bold", fontFamily: "sans-serif", marginTop: 50}}>{service.risk} RISK</p>
                    </div>
                </div>
                <hr/>
                <div className="ai-explain-box">
                    <h4>🤖 AI Auditor Insight</h4>
                    <p>This app tracks your <b>location</b> and <b>financial history</b>.
                        It shares data with 3rd party advertisers.</p>
                </div>

                <div className="permissions-list">
                    <h4>Data Accessed:</h4>
                    {service.data.map(item => (
                        <div key={item} className="perm-item" style={{border: "3px solid #5b5a5a"}}>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                {/* AI-ДАН КЕЛГЕН АНАЛИЗ НӘТИЖЕСІ */}
                {aiDetail && (
                    <div className="ai-analysis-result">
                        <h4>🔍 AI Detailed Breakdown:</h4>
                        <p style={{color: "black", fontSize: 15}}>{aiDetail}</p>
                    </div>
                )}

                <div className="button-service">
                    <button className="revoke-btn" onClick={onRevoke}>✖ Revoke Access completely</button>
                    <button
                        className="explain-btn"
                        onClick={handleExplainMore}
                        disabled={loading}
                    >
                        {loading ? "Analyzing..." : "Explain More 🔎"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;