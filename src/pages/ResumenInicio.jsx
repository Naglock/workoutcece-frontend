import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ResumenInicio = () => {
    const [stats, setStats] = useState({ totalAtletas: 0, ultimosAtletas: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/coach/athletes');
                const data = response.data;
                
                setStats({
                    totalAtletas: data.length,
                    ultimosAtletas: data.slice(0, 5)
                });
            } catch (err) {
                console.error("Error cargando resumen:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <p>Cargando dashboard...</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.welcome}>¡Hola de nuevo, Coach!</h2>
            
            {/* Tarjetas de Estadísticas Rápidas */}
            <div style={styles.statsGrid}>
                <div style={styles.cardStat}>
                    <span style={styles.statLabel}>Atletas Activos</span>
                    <span style={styles.statNumber}>{stats.totalAtletas}</span>
                </div>
                <div style={styles.cardStat}>
                    <span style={styles.statLabel}>Rutinas Pendientes</span>
                    <span style={styles.statNumber}>--</span>
                </div>
            </div>

            {/* Tabla de Atletas en el Dashboard */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>Atletas Recientes (ultimos 5 registrados)</h3>
                    <button 
                        onClick={() => navigate('/dashboard/atletas')} 
                        style={styles.viewAllBtn}
                    >
                        Ver todos
                    </button>
                </div>

                <div style={styles.recentList}>
                    {stats.ultimosAtletas.length === 0 ? (
                        <p style={styles.emptyText}>Aún no tienes atletas vinculados.</p>
                    ) : (
                        stats.ultimosAtletas.map(atleta => (
                            <div key={atleta.id} style={styles.atletaItem}>
                                <div style={styles.atletaInfo}>
                                    <div style={styles.avatar}>
                                        {atleta.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={styles.atletaName}>{atleta.fullName || atleta.username}</div>
                                        <div style={styles.atletaEmail}>{atleta.email}</div>
                                    </div>
                                </div>
                                <button 
                                onClick={() => navigate(`/dashboard/atletas/${atleta.id}`)}
                                style={styles.miniBtn}>Gestionar</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '10px' },
    welcome: { color: '#1e293b', marginBottom: '25px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    cardStat: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    statLabel: { color: '#64748b', fontSize: '14px', fontWeight: '500' },
    statNumber: { color: '#3b82f6', fontSize: '32px', fontWeight: 'bold' },
    section: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { margin: 0, color: '#1e293b', fontSize: '18px' },
    viewAllBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' },
    recentList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    atletaItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' },
    atletaInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatar: { width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#64748b' },
    atletaName: { fontWeight: '600', color: '#334155' },
    atletaEmail: { fontSize: '12px', color: '#94a3b8' },
    miniBtn: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontSize: '12px' },
    emptyText: { textAlign: 'center', color: '#94a3b8', padding: '20px' }
};

export default ResumenInicio;