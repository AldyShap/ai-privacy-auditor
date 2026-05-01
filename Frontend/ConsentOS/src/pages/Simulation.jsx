  import React, { useState } from 'react';
  import { calculateScore } from '../utils/calculateScore';
  import { mockServices } from '../data/mockData'; // Бастапқы деректер
  import ScoreCircle from '../components/ScoreCircle';
  import { getAIExplanation } from '../services/aiService.js';
  import "./Simulation.css";

  const APPS_DATA = [
    { id: 1, name: "New Social App", risk: "high", impact: -15, icon: "📱" },
    { id: 2, name: "Health Tracker", risk: "medium", impact: -5, icon: "🏥" },
    { id: 3, name: "Weather Pro", risk: "low", impact: -2, icon: "🌤️" },
    { id: 4, name: "Flashlight Plus", risk: "critical", impact: -25, icon: "🔦" }
  ];

  const permissions = [
    { name: "Күнделікті орынды бақылау", sub: "(Geolocation)", icon: "📍" },
    { name: "Контактілерге рұқсат", sub: "(Contacts)", icon: "👤" },
    { name: "Микрофонға рұқсат", sub: "(Microphone)", icon: "🎙️" },
    { name: "Фотогалереяға рұқсат", sub: "(Photos)", icon: "🖼️" }
  ];

  const AppsLogos = [
    {
      id:8,
      name:"Kaspi.kz",
      category:"Finance",
      risk:"HIGH",
      color:"#ef4444",
      img_src:"/kaspi.jpg",
      lastAccess:"2025-04-29",
      data:["Location", "Financial Data", "Contacts", "SMS", "Call Logs"],
      impact: 10
    },
    {
      id:2,
      name:"Kundelik.kz",
      category:"Education",
      risk:"HIGH",
      color:"#ef4444",
      img_src:"/kundelik.jpg",
      lastAccess:"2025-04-29",
      data:["Camera", "Microphone", "Location", "Contacts", "Calendar", "Photos"],
      impact: 11
    },
    {
    id:31,
    name:"Instagram",
    category:"Social Media",
    risk:"MEDIUM",
    color:"#f59e0b",
    img_src:"/instagramlogo.png",
    lastAccess:"2025-04-29",
    data:["Camera", "Photos", "Contacts", "Location"],
    impact: 8
  },
  {
    id:32,
    name:"TikTok",
    category:"Social Media",
    risk:"HIGH",
    color:"#ef4444",
    img_src:"/image 64.png",
    lastAccess:"2025-04-29",
    data:["Camera", "Microphone", "Photos", "Location", "Contacts", "Browser History"],
    impact: 12
  },
  {
    id:33,
    name:"Telegram",
    category:"Social Media",
    risk:"HIGH",
    color:"#ef4444",
    img_src:"/telegramlogo.png",
    lastAccess:"2025-04-29",
    data:["Microphone", "Camera", "Contacts", "Location", "Files"],
    impact: 9
  },
  {
    id:36,
    name:"Facebook",
    category:"Social Media",
    risk:"HIGH",
    color:"#ef4444",
    img_src:"/facebook.png",
    lastAccess:"2025-04-28",
    data:["Location", "Contacts", "Browser History", "Photos"],
    impact: 6
  },
  {
    id:34,
    name:"Youtube",
    category:"Social Media",
    risk:"MEDIUM",
    color:"#f59e0b",
    img_src:"/youtube (2).png",
    lastAccess:"2025-04-28",
    data:["Location", "Browser History", "Contacts"],
    impact: 5

  }
  ]

  const Simulation = () => {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(78); // Бастапқы балл
    const [foundAppData, setFoundAppData] = useState(null); // Нақты бэкстен келетін деректер
    const [isModalOpen, setIsModalOpen] = useState(false); // Модалканы ашу/жабу

    const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
        // query параметрінің атын бэкендтегідей 'name' деп өзгерттік
        const response = await fetch(`https://ai-privacy-auditor.onrender.com/api/analyze-app?name=${encodeURIComponent(trimmed)}`);
        
        if (!response.ok) {
            throw new Error("Сервис талдау кезінде қате кетті");
        }

        const data = await response.json();
        const aiText = data.explanation;

        // Пайыздық төмендеуді мәтін ішінен іздеу (регулярлы өрнек арқылы)
        // Мысалы: "-10%" немесе "10%" дегенді тауып алады
        const impactMatch = aiText.match(/-(\d+)%/);
        const impactValue = impactMatch ? parseInt(impactMatch[1]) : 5; // Егер табылмаса, дефолтты 5%

        setFoundAppData({
            title: trimmed,
            ai_analysis: aiText,
            impact: impactValue
        });
        
        setIsModalOpen(true);
    } catch (error) {
        alert("Қате: " + error.message);
    } finally {
        setLoading(false);
    }
};

    const handleLogo = (app) => {
      const newScore = Math.max(78 - app.impact, 0);
      setScore(newScore);
      setResult({
        reasons: [
          `Бұл сервис ${app.data.length} түрлі деректерді жинайды: ${app.data.join(", ")}.`,
        ],
        score_impact: app.impact,
      });
    }

    return (
      <div className="simulation-overlay">
        <div className="simulation-modal">
          <br></br>
          <br></br>
          <br></br>
          <h2 className="main-title">ЖАҢА СЕРВИСТІ ТЕКСЕРУ: ҚҰПИЯЛЫҚТЫ СИМУЛЯЦИЯЛАУ</h2>
          
          <div className="modal-content">
            {/* Левая часть: Поиск и Разрешения */}
            <div className="left-panel">
              <h3>ТЕКСЕРІЛЕТІН СЕРВИС: ПОИСК</h3>
              <div className="search-box">
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Сервис атауын іздеу..." 
                  required
                  id="search-input"
                />
                <button type="button" onClick={handleSearch} style={{border: "2px solid skyblue", fontSize: 20, padding: 5, borderRadius: 10}}>{loading ? "..." : "🔍"}</button>
              {/* <button type="button" onClick={async () => {
                try {
                  const response = await fetch('http://localhost:8000/api/test');
                  const data = await response.json();
                  alert('Backend connection successful: ' + JSON.stringify(data));
                } catch (error) {
                  alert('Backend connection failed: ' + error.message);
                }
              }}>Test Backend</button> */}
              </div>

              <div className='services-logo' style={{display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))"}}>
                {
                  AppsLogos.map((app) => (
                    <img key={app.id} src={app.img_src} alt={app.name} title={app.name} className="service-logo" onClick={() => {
                      setScore(78);
                      handleLogo(app);
                    }} />
                  ))
                }
              </div>

              <div className="permissions-list">
                  {permissions.map((perm, i) => (
                    <div className="perm-item" key={i}>
                      <div className="perm-info">
                        <div className="perm-icon">{perm.icon}</div>
                        <div className="perm-text-group">
                          <span className="perm-name">{perm.name}</span>
                          <span className="perm-desc">{perm.sub}</span>
                        </div>
                      </div>
                      
                      <label className="toggle-switch">
                        <input type="checkbox" className="toggle-input" defaultChecked={perm.name !== "Микрофонға рұқсат"} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Правая часть: Анализ */}
            <div className="right-panel">
              <h3>БОЛЖАМДЫ НӘТИЖЕЛЕР: AI АНАЛИЗІ</h3>
              
              <div className="scores-container">
                <div className="score-circle green">
                  <div className="score-val"><ScoreCircle score={score}/></div>
                  <span>ТҰРАҚТЫ СТАТУС</span>
                </div>
                <div className="score-circle red">
                  <div className="score-val"><ScoreCircle score={Math.max(score - (result?.score_impact ?? 0), 0)} /></div>
                  <span>ЖОҒАРЫ ҚАУІП ЗОНАСЫ</span>
                </div>
              </div>

              {result && (
                <div className="ai-reasons">
                  <h4>СИМУЛЯЦИЯ КӨРСЕТКІШІ ТӨМЕНДЕУІНІҢ СЕБЕПТЕРІ:</h4>
                  <ul>
                    {result.reasons.map((r, i) => (
                      <li key={i} style={{fontSize: 15, fontFamily: "sans-serif"}}>⚠️ {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="action-buttons">
                <button className="btn-primary" onClick= {() => {
                  alert("Сервис қауіпсіз деп танылды және орнатуға болады.");
                  setResult(null);
                }}>ТЕКСЕРУ ЖӘНЕ ҚАУІПСІЗ ОРНАТУ</button>
                <button className="btn-secondary" onClick={() => setResult(null)}>БАС ТАРТУ</button>
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && foundAppData && (
    <div className="app-info-popup-overlay">
      <div className="app-info-popup">        
        <div className="popup-header">
          <div style={{textAlign: "center", width: "100%"}}>
            <h2 style={{fontFamily: "sans-serif", fontSize: 40}}>📱{foundAppData.title}</h2>
          </div>
        </div>

        <div className="popup-body">
          <h3 style={{fontFamily: "sans-serif"}}>AI АНАЛИЗІ:</h3>
          <div className="ai-text" >
            {foundAppData.ai_analysis}
          </div>
        </div>

        <div className="popup-actions">
          <button className="btn-install" onClick={() => alert("Орнату басталды...")}>Орнату</button>
          <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Жабу</button>
        </div>
      </div>
    </div>
  )}
      </div>
    );
  };
  export default Simulation;