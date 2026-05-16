import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AtletaStyles.css';

const AthleteLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="athlete-app-container">
            <div className="athlete-mobile-wrapper">
                
                <div className="athlete-content-area">
                    <Outlet /> 
                </div>

                <nav className="athlete-bottom-nav">
                    <button 
                        className={`athlete-nav-btn ${isActive('/atleta') ? 'active' : ''}`} 
                        onClick={() => navigate('/atleta')}
                    >
                        <span className="athlete-nav-icon">⚡</span>
                        <span className="athlete-nav-text">Entrenar</span>
                    </button>
                    
                    <button 
                        className={`athlete-nav-btn ${isActive('/atleta/historial') ? 'active' : ''}`} 
                        onClick={() => navigate('/atleta/historial')}
                    >
                        <span className="athlete-nav-icon">📋</span>
                        <span className="athlete-nav-text">Historial</span>
                    </button>

                    <button className="athlete-nav-btn logout" onClick={handleLogout}>
                        <span className="athlete-nav-icon">🚪</span>
                        <span className="athlete-nav-text">Salir</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default AthleteLayout;