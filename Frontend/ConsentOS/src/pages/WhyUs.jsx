import { useState } from "react";
import "./WhyUs.css";

const steps = [
  { title: "Қосылу Қызметі", icon: "🔗" },
  { title: "Жасанды Интелектпен талдау", icon: "🧠" },
  { title: "Тәуекел Анықталды", icon: "⚠️" },
  { title: "Әрекет Етіңіз", icon: "⚡" },
];

const features = [
  {
    title: "Біз күрделілікті жеңілдетеміз",
    desc: "Жасанды интелект заңды келісімдерді қарапайым тілде түсіндіреді",
    icon: "🧠",
  },
  {
    title: "Толық ашықтық",
    desc: "Барлық қосылған қызметтерді бір жерден қараңыз",
    icon: "👁",
  },
  {
    title: "Жедел басқару",
    desc: "Бір рет басу арқылы кіруді болдырмаңыз",
    icon: "⚡",
  },
  {
    title: "Ақылды шешімдер",
    desc: "Құпиялылық көрсеткіші тәуекелдерді түсінуге көмектеседі",
    icon: "📊",
  },
];

export default function Whyus() {
  const [active, setActive] = useState(0);
  

  return (
    <>
    <div className="flow-wrapper">
      <h2>Why us and How it works</h2>

      <div className="flow-line">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flow-step ${index <= active ? "active" : ""}`}
            onClick={() => setActive(index)}
          >
            <div className="circle">{step.icon}</div>
            <p>{step.title}</p>
          </div>
        ))}

        <div
          className="progress"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div className="flow-content">
        {active === 0 && <p>Сіз өз қызметіңізді қосасыз (Google, Instagram, etc.)</p>}
        {active === 1 && <p>Жасанды интелект рұқсаттар мен деректерді пайдалануды талдайды</p>}
        {active === 2 && <p>Жүйе ықтимал тәуекелдерді анықтайды</p>}
        {active === 3 && <p>Сіз бірден кіруді жоя аласыз</p>}
      </div>
    </div>

    <div className="why-container">
      {features.map((item, i) => (
        <div key={i} className="why-card">
          <div className="icon">{item.icon}</div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
    </>
  );
}