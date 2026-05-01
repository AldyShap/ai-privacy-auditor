import React, { useState } from 'react';
import "./DataList.css";    

const DataList = () => {
    const [userName] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
            return "User";
        }

        const userObj = JSON.parse(savedUser);
        return userObj.username || userObj.user || userObj.name || "User";
    });

    return (
        <div className="dataList-container">
            <img src="/contendOs.png" alt="contendOs logo" className="contendOs-logo" />
            <div className="profile-contend">
                {/* Енді бұл жерде локальді state-тегі userName тұрады */}
                <h3>{userName}</h3> 
                <img src="/profile.png" alt="profile-photo" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            </div>
        </div>
    );
}

export default DataList;