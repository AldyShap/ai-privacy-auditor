import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

    useEffect(() => {
    const email=searchParams.get("email");
    const name=searchParams.get("name");

    if(!email || !name){
        navigate("/login");
        return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        username:name,
        email
      })
    );

    navigate("/dashboard");

  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
      <img src="/contendOs.png" style={{ width: '150px' }} alt="Logo" />
      <h2>Жүйеге кіру орындалуда...</h2>
      <div className="loader">Сәл күте тұрыңыз</div>
    </div>
  );
};

export default GoogleCallback;