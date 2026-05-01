import { Routes, Route} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Simulation from "./pages/Simulation.jsx";
import Navbar from "./components/Navbar.jsx";
import DataList from "./components/DataList.jsx";
import Welcome from "./pages/Welcome.jsx";
import Settings from "./pages/Settings.jsx";
import WhyUs from "./pages/WhyUs.jsx";
import RegistrationPage from "./pages/Regestration.jsx";
import LoginPage from "./pages/Login.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";
import AiChat from "./pages/AiChat.jsx";

function App() {
  return (
    <div className="app-container">
        <DataList/>

        <Routes>
            {/* Басты бет - Dashboard */}
            <Route path="/" element={<Welcome />}></Route>
            <Route path="/dashboard" element={
              <div>
              <Navbar />
              <Dashboard />
            </div>
            }/>

            {/* Симуляция беті */}
            <Route path="/simulate" element={
              <div>
                <Navbar />
                <Simulation />
              </div>
            } />
            <Route path="/why-us" element={
              <div>
                <Navbar />
                <WhyUs />
              </div>
            }/>
            <Route path="/settings" element={
              <div>
                <Navbar />
                <Settings />
            </div>
            }/>
            <Route path="/signup" element={
              <div>
              <RegistrationPage />
            </div>
            }></Route>
            <Route path="/login" element={
              <div>
              <LoginPage />
            </div>
            }></Route>
            <Route path="/chat" element={
              <div>
              <Navbar />
              <AiChat/>
            </div>
            }></Route>
            <Route path="/auth/google/callback" element={<GoogleCallback/>} />

        </Routes>
    </div>
  )
}

export default App
