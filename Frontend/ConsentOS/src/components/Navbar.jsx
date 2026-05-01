import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Navbar.css";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* 1. ГАМБУРГЕР БАТЫРМАСЫ (Сол жақ жоғарыда) */}
            <button className="menu-toggle" onClick={toggleNavbar}>
                {isOpen ? '✕' : '☰'}
            </button>

            {/* 2. ВЕРТИКАЛЬДІ SIDEBAR */}
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <img src={"/contendOs.png"} alt="Consent OS" />
                </div>

                <ul className="nav-links">
                    <li><Link to="/dashboard" onClick={toggleNavbar}>🏠 Dashboard</Link></li>
                    <li><Link to="/simulate" onClick={toggleNavbar}>🧪 Simulation</Link></li>
                    <li><Link to="/why-us" onClick={toggleNavbar}>❔ Why us?</Link></li>
                    <li><Link to="/chat" onClick={toggleNavbar}>🤖💬 | Chat</Link></li>
                    <li><Link to="/settings" onClick={toggleNavbar}>⚙️ Settings</Link></li>
                    

                </ul>
            </nav>

            {/* 3. OVERLAY (Мәзір ашылғанда экранды бұлдырату) */}
            {isOpen && <div className="overlay" onClick={toggleNavbar}></div>}
        </>
    );
};

export default Navbar;