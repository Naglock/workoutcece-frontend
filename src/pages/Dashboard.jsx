import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../components/CoachStyles.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState({ username: '', role: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserData({ username: decoded.sub, role: decoded.role || 'COACH' });
            } catch (error) {}
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="coach-portal">
            <aside className="coach-sidebar">
                <div className="coach-sidebar-header">
                    <h2>WorkoutCeCe</h2>
                    <span className="coach-badge">{userData.role}</span>
                </div>
                
                <nav className="coach-nav">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className={location.pathname === '/dashboard' ? 'coach-nav-item active' : 'coach-nav-item'}
                    >
                        Inicio
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/atletas')}
                        className={location.pathname === '/dashboard/atletas' ? 'coach-nav-item active' : 'coach-nav-item'}
                    >
                        Mis Atletas
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/ejercicios')}
                        className={location.pathname === '/dashboard/ejercicios' ? 'coach-nav-item active' : 'coach-nav-item'}
                    >
                        Ejercicios
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/rutinas')}
                        className={location.pathname === '/dashboard/rutinas' ? 'coach-nav-item active' : 'coach-nav-item'}
                    >
                        Planificador de Rutinas
                    </button>
                </nav>

                <div className="coach-sidebar-footer">
                    <p className="coach-user-text">👤 {userData.username}</p>
                    <button onClick={handleLogout} className="coach-btn-logout">Cerrar Sesión</button>
                </div>
            </aside>

            <main className="coach-main-content">
                <header className="coach-topbar">
                    <h1>{location.pathname === '/dashboard/atletas' ? 'Gestión de Atletas' : 'Panel de Control'}</h1>
                </header>

                <div className="coach-content-area">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default Dashboard;