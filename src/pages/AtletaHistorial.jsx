import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const AtletaHistorial = () => {
    const navigate = useNavigate();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId || decoded.id;

                if (alumnoId) {
                    const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                    setRoutines(response.data);
                }
            } catch (err) {
                console.error("Error al cargar el historial:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, []);

    if (loading) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Cargando agenda...</p>;

    return (
        <div className="atleta-agenda-container">
            <div className="atleta-agenda-header">
                <h2 className="atleta-agenda-title">Mi Agenda</h2>
                <p className="atleta-agenda-subtitle">Cronograma y registro de entrenamientos</p>
            </div>

            <div className="atleta-agenda-list">
                {routines.length === 0 ? (
                    <div className="atleta-empty-state">
                        <p>No tienes planificaciones registradas en tu agenda.</p>
                    </div>
                ) : (
                    routines.map((routine) => (
                        <div key={routine.id} className="atleta-agenda-item">
                            <div className="atleta-agenda-meta">
                                <span className="atleta-agenda-date">
                                    {new Date(routine.scheduledDate).toLocaleDateString('es-CL', {
                                        weekday: 'short', day: 'numeric', month: 'short'
                                    })}
                                </span>
                                <span className={`atleta-agenda-badge ${(routine.status || 'PENDIENTE').toLowerCase()}`}>
                                    {routine.status || 'PENDIENTE'}
                                </span>
                            </div>
                            
                            <div className="atleta-agenda-card-body">
                                <h4 className="atleta-agenda-card-title">{routine.name}</h4>
                                <p className="atleta-agenda-card-info">
                                    {routine.exercises?.length || 0} ejercicios asignados
                                </p>
                                
                                {routine.status !== "COMPLETADO" ? (
                                    <button 
                                        onClick={() => navigate(`/atleta/rutina-activa?id=${routine.id}`)}
                                        className="atleta-agenda-action-btn"
                                    >
                                        Iniciar Entrenamiento ▶
                                    </button>
                                ) : (
                                    <div className="atleta-agenda-completed-summary">
                                        <span>Sesión completada ✓</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="atleta-spacer" />
        </div>
    );
};

export default AtletaHistorial;