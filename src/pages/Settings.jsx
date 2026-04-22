import React, { useState } from 'react';
import "./Settings.css";

const Settings = () => {
    // Свитчтердің күйін сақтау үшін
    const [settings, setSettings] = useState({
        notifications: true,
        aiAssistant: true,
        autoScan: true
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="settings-wrapper">
            <h2 className="settings-title">Управление безопасностью</h2>

            <div className="settings-list">
                {/* Умные уведомления */}
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Умные уведомления</h3>
                        <p>Оповещать, если риск приложения стал критическим</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={() => toggleSetting('notifications')}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                {/* AI-ассистент */}
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>AI-ассистент</h3>
                        <p>Переводить сложные согласия на простой язык</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.aiAssistant}
                            onChange={() => toggleSetting('aiAssistant')}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                {/* Авто-сканирование */}
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Авто-сканирование</h3>
                        <p>Автоматическая проверка новых приложений</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.autoScan}
                            onChange={() => toggleSetting('autoScan')}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <div className="profile-section">
                <h2 className="settings-title">Профиль</h2>
                <div className="profile-details">
                    <p><strong>Имя:</strong> Venom</p>
                    <p><strong>Почта:</strong> venom.albol.8@gmail.com</p>
                </div>
                <button className="logout-btn">Log out</button>
            </div>
        </div>
    );
};

export default Settings;