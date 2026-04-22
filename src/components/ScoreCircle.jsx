import React from 'react';
import './ScoreCircle.css';

const ScoreCircle = ({ score = 78 }) => {
    const size = 280;
    const strokeWidth = 14;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2 - 10;

    const circumference = 2 * Math.PI * radius;
    const halfCircumference = circumference / 2;

    const offset = halfCircumference - (score / 100) * halfCircumference;

    const angle = (score / 100) * 180 - 180; // угол для полуокружности

    const rad = (angle * Math.PI) / 180;

    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);

    // 🔥 статус
    const getStatus = () => {
        if (score >= 80) return "SECURE";
        if (score >= 60) return "STABLE";
        return "AT RISK";
    };

    // 🔥 цвет статуса
    const getColor = () => {
        if (score >= 80) return "#10b981";
        if (score >= 60) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <>
        <div className="gauge-wrapper">

            <div className="gauge-chart">

                <svg width={size} height={size / 2 + 20}>

                    <line
                        x1={x}
                        y1={y}
                        x2={x + 20 * Math.cos(rad)}
                        y2={y + 20 * Math.sin(rad)}
                        stroke="#374151"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="70%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>

                    </defs>

                    {/* фон */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        strokeDasharray={halfCircumference}
                        strokeLinecap="round"
                        transform={`rotate(-180, ${center}, ${center})`}
                    />

                    {/* прогресс */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={halfCircumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform={`rotate(-180, ${center}, ${center})`}
                        style={{
                            transition: 'stroke-dashoffset 1s ease'
                        }}
                    />

                </svg>

                {/* центр */}
                <div className="score-center-text">
                    <h1 className="score-num">{score}</h1>

                    <span
                        className="score-status"
                        style={{ color: getColor() }}
                    >
                        {getStatus()}
                    </span>
                </div>
            </div>

            {/* подпись */}
            <div className="score-footer">
                <h2>Your Privacy Score</h2>
                <p>Higher is better</p>
            </div>

        </div>
        </>
    );
};

export default ScoreCircle;