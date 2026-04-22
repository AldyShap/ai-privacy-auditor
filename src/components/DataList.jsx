import "./DataList.css"

const DataList = () => {
    return (
        <div className="dataList-container">
            <img src={"src/assets/contendOs.png"} alt="contendOs logo" className="contendOs-logo" />
            <div className="profile-contend">
                <h3>Profile</h3> <img src={"src/assets/L_avatar.jpg"} alt="profile-photo"/>
            </div>
        </div>
    );
}

export default DataList;