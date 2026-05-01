import React, { useState, useEffect, useRef } from 'react';
import "./AiChat.css";

function AiChat() {
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Сәлем! Мен Consent OS-тің ЖИ. Құпиялылық пен қауіпсіздік туралы не білгің келеді?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Хабарлама жазылған сайын төменге автоматты түрде түсіру
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input; // Мәтінді сақтап қалу
    setInput("");
    setLoading(true);

    try {
        // GET сұранысы: параметрді URL-ге қосамыз
        const response = await fetch(`http://localhost:8000/api/ai-chat?question=${encodeURIComponent(currentInput)}`);
        
        if (!response.ok) throw new Error("Сервер қатесі");

        const data = await response.json();
        
        const botMessage = { 
            role: "assistant", 
            text: data.explanation || data.error || "Түсініксіз жауап келді." 
        };
        
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        setMessages(prev => [...prev, { role: "assistant", text: "Байланыс үзілді: " + error.message }]);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="chat-container">
            <div className="chat-window">
                <div className="messages-list">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.role}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="message-wrapper assistant"><div className="message-bubble typing">Consent OS ойланып жатыр...</div></div>}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Сұрағыңды жаз..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>Жіберу</button>
                </form>
            </div>
        </div>
    );
}

export default AiChat;