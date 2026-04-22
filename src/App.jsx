import { useState } from 'react'
import Dashboard from "./pages/Dashboard.jsx";

import './App.css'
import Simulation from "./pages/Simulation.jsx";
import {Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import DataList from "./components/DataList.jsx";
import Welcome from "./pages/Welcome.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
        <DataList/>
        <Navbar />

        <Routes>
            {/* Басты бет - Dashboard */}
            <Route path="/" element={<Welcome />}></Route>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Симуляция беті */}
            <Route path="/simulate" element={<Simulation />} />
            <Route path="/settings" element={<Settings/>}/>
        </Routes>
    </div>
  )
}

export default App
