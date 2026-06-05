import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ResumenInicio = () => {
    const [stats, setStats] = useState({ 
        totalAtletas: 0, 
        ultimosAtletas: [], 
        rutinasPendientes: 0,
        rutinasCompletadas: 0 
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/coach/athletes');
                const atletas = response.data;
                
                let totalPendientes = 0;
                let totalCompletadas = 0;

                if (atletas.length > 0) {
                    const rutinasPromises = atletas.map(atleta => 
                        api.get(`/workouts/my-routine/${atleta.id}`).catch(() => ({ data: [] }))
                    );
                    
                    const rutinasResults = await Promise.all(rutinasPromises);
                    
                    rutinasResults.forEach(res => {
                        const rutinasAlumno = res.data || [];
                        
                        const pendientesAlumno = rutinasAlumno.filter(r => {
                            const estado = (r.estado || r.status || '').toUpperCase();
                            return estado !== 'COMPLETADA';
                        });
                        
                        const completadasAlumno = rutinasAlumno.filter(r => {
                            const estado = (r.estado || r.status || '').toUpperCase();
                            return estado === 'COMPLETADA';
                        });

                        totalPendientes += pendientesAlumno.length;
                        totalCompletadas += completadasAlumno.length;
                    });
                }

                setStats({
                    totalAtletas: atletas.length,
                    ultimosAtletas: atletas.slice(0, 5),
                    rutinasPendientes: totalPendientes,
                    rutinasCompletadas: totalCompletadas
                });
            } catch (err) {
                console.error("Error cargando resumen:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <p style={{ padding: '20px' }}>Cargando dashboard...</p>;

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: 'var(--coach-text-dark)' }}>
                ¡Hola de nuevo, Coach!
            </h2>
            
            <div className="coach-stat-grid">
                <div className="coach-stat-card">
                    <span className="coach-stat-label">Atletas Activos</span>
                    <span className="coach-stat-number">{stats.totalAtletas}</span>
                </div>
                <div className="coach-stat-card">
                    <span className="coach-stat-label">Rutinas Pendientes</span>
                    <span className="coach-stat-number" style={{ color: stats.rutinasPendientes > 0 ? '#eab308' : 'inherit' }}>
                        {stats.rutinasPendientes}
                    </span>
                </div>
                <div className="coach-stat-card">
                    <span className="coach-stat-label">Rutinas Completadas</span>
                    <span className="coach-stat-number" style={{ color: stats.rutinasCompletadas > 0 ? '#22c55e' : 'inherit' }}>
                        {stats.rutinasCompletadas}
                    </span>
                </div>
            </div>

            <div className="coach-card">
                <div className="coach-card-header">
                    <h3 style={{ margin: 0 }}>Atletas Recientes</h3>
                    <button 
                        onClick={() => navigate('/dashboard/atletas')} 
                        className="coach-btn coach-btn-outline"
                    >
                        Ver todos
                    </button>
                </div>

                <div className="coach-list">
                    {stats.ultimosAtletas.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--coach-text-muted)', padding: '20px' }}>
                            Aún no tienes atletas vinculados.
                        </p>
                    ) : (
                        stats.ultimosAtletas.map(atleta => (
                            <div key={atleta.id} className="coach-list-item">
                                <div className="coach-list-info">
                                    <div className="coach-avatar">
                                        {atleta.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="coach-list-name">{atleta.fullName || atleta.username}</div>
                                        <div className="coach-list-email">{atleta.email}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate(`/dashboard/atletas/${atleta.id}`)}
                                    className="coach-btn coach-btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Gestionar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumenInicio;