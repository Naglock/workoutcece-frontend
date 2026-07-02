import { createContext, useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AtletaStyles.css';    
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' };
const modalContentStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const btnSuccessStyle = { padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnDangerStyle = { padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnOutlineStyle = { padding: '12px', backgroundColor: 'transparent', border: '2px solid #cbd5e1', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
export const WorkoutSessionContext = createContext(null);

const AthleteLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [showNavModal, setShowNavModal] = useState(false);
    const [pendingPath, setPendingPath] = useState(null);
    const [onSaveDraftCallback, setOnSaveDraftCallback] = useState(null);

    const handleLogout = () => {
        if (isWorkoutActive) {
            setPendingPath('logout');
            setShowNavModal(true);
        } else {
            executeLogout();
        }
    };

    const executeLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };
    const handleNavigation = (path) => {
        if (isActive(path)) return;
        
        if (isWorkoutActive) {
            setPendingPath(path);
            setShowNavModal(true);
        } else {
            navigate(path);
        }
    };

    const isActive = (path) => location.pathname === path;
    const handleExitWithoutSaving = () => {
        setIsWorkoutActive(false);
        setShowNavModal(false);
        pendingPath === 'logout' ? executeLogout() : navigate(pendingPath);
    };

    const handleSaveAndExit = async () => {
        if (onSaveDraftCallback) {
            await onSaveDraftCallback(); 
        }
        setIsWorkoutActive(false);
        setShowNavModal(false);
        pendingPath === 'logout' ? executeLogout() : navigate(pendingPath);
    };

    return (
        <WorkoutSessionContext.Provider value={{ 
            setIsWorkoutActive, 
            setOnSaveDraftCallback, 
            handleNavigation 
        }}>
            <div className="athlete-app-container">
                <div className="athlete-mobile-wrapper">
                    
                    <div className="athlete-content-area">
                        <Outlet /> 
                    </div>

                    <nav className="athlete-bottom-nav">
                        <button 
                            className={`athlete-nav-btn ${isActive('/atleta') ? 'active' : ''}`} 
                            onClick={() => handleNavigation('/atleta')}
                        >
                            <span className="athlete-nav-icon">⚡</span>
                            <span className="athlete-nav-text">Entrenar</span>
                        </button>
                        
                        <button 
                            className={`athlete-nav-btn ${isActive('/atleta/historial') ? 'active' : ''}`} 
                            onClick={() => handleNavigation('/atleta/historial')}
                        >
                            <span className="athlete-nav-icon">📋</span>
                            <span className="athlete-nav-text">Historial</span>
                        </button>

                        <button className="athlete-nav-btn logout" onClick={handleLogout}>
                            <span className="athlete-nav-icon">🚪</span>
                            <span className="athlete-nav-text">Salir</span>
                        </button>
                    </nav>
                    {showNavModal && (
                        <div style={modalOverlayStyle}>
                            <div style={modalContentStyle}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Entrenamiento en curso</h3>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                    ¿Estás seguro de que deseas salir? Puedes guardar tu progreso como borrador para continuar después.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={handleSaveAndExit} style={btnSuccessStyle}>
                                        💾 Guardar Borrador y Salir
                                    </button>
                                    <button onClick={handleExitWithoutSaving} style={btnDangerStyle}>
                                        🚪 Salir sin guardar
                                    </button>
                                    <button onClick={() => setShowNavModal(false)} style={btnOutlineStyle}>
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WorkoutSessionContext.Provider>
    );
};

export default AthleteLayout;