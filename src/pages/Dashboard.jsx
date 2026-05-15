import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
            } catch (error) {
                console.error("Error decodificando el token", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={styles.layout}>
            {/* BARRA LATERAL */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2>WorkoutCeCe</h2>
                    <span style={styles.badge}>{userData.role}</span>
                </div>
                
                <nav style={styles.nav}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={location.pathname === '/dashboard' ? styles.navItemActive : styles.navItem}
                    >
                        Inicio
                    </button>
                    <button 
                        onClick={() => {
                            navigate('/dashboard/atletas');
                        }}
                        style={location.pathname === '/dashboard/atletas' ? styles.navItemActive : styles.navItem}
                    >
                        Mis Atletas
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/ejercicios')}
                        style={location.pathname === '/dashboard/ejercicios' ? styles.navItemActive : styles.navItem}
                    >
                        Ejercicios
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/rutinas')}
                        style={location.pathname === '/dashboard/rutinas' ? styles.navItemActive : styles.navItem}
                    >
                        Planificador de Rutinas
                    </button>
                </nav>

                <div style={styles.sidebarFooter}>
                    <p style={styles.userText}>👤 {userData.username}</p>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main style={styles.mainContent}>
                <header style={styles.topbar}>
                    <h1>{location.pathname === '/dashboard/atletas' ? 'Gestión de Atletas' : 'Panel de Control'}</h1>
                </header>

                <div style={styles.contentArea}>
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'system-ui, sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #334155' },
    badge: { backgroundColor: '#3b82f6', fontSize: '10px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' },
    nav: { flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' },
    navItem: { padding: '15px 20px', backgroundColor: 'transparent', color: '#cbd5e1', border: 'none', borderLeft: '4px solid transparent', textAlign: 'left', cursor: 'pointer', fontSize: '15px' },
    navItemActive: { padding: '15px 20px', backgroundColor: '#334155', color: 'white', border: 'none', borderLeft: '4px solid #3b82f6', textAlign: 'left', cursor: 'pointer', fontSize: '15px' },
    sidebarFooter: { padding: '20px', borderTop: '1px solid #334155' },
    userText: { margin: '0 0 10px 0', fontSize: '14px', color: '#94a3b8' },
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { backgroundColor: 'white', padding: '20px 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    contentArea: { flex: 1, overflowY: 'auto' }
};

export default Dashboard;