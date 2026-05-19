import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const AtletaRutinaPreview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routineId = searchParams.get('id');
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !routineId) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId;

                const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                const rutinaEncontrada = response.data.find(r => r.id === parseInt(routineId));

                if (rutinaEncontrada) {
                    setRoutine(rutinaEncontrada);
                }
            } catch (err) {
                console.error("Error cargando previsualización:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, [routineId]);

    if (loading) return <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Cargando resumen de sesión...</p>;
    if (!routine) return <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Rutina no encontrada.</p>;

    return (
        <div className="atleta-preview-container">
            <div className="atleta-preview-header">
                <div className={`atleta-card-badge ${(routine.status || 'PENDIENTE').toLowerCase()}`} style={{ display: 'inline-block', marginBottom: '10px' }}>
                    {routine.status || 'PENDIENTE'}
                </div>
                <h1 className="atleta-preview-title">{routine.name}</h1>
                <p className="atleta-preview-subtitle">
                    {routine.exercises?.length || 0} ejercicios planificados
                </p>
            </div>

            <div className="atleta-preview-content">
                <h3 className="atleta-section-title">Ejercicios a realizar:</h3>
                <div className="atleta-preview-list">
                    {routine.exercises?.map((ex, idx) => (
                        <div key={idx} className="atleta-preview-item">
                            <span className="atleta-preview-item-number">{idx + 1}</span>
                            <div className="atleta-preview-item-info">
                                <h4>{ex.exercise?.name}</h4>
                                <p>{ex.sets} series x {ex.reps} reps</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="atleta-preview-actions">
                <button 
                    className="atleta-preview-btn-start"
                    onClick={() => navigate(`/atleta/rutina-activa?id=${routine.id}`)}
                >
                    Iniciar Entrenamiento ▶
                </button>
                <button 
                    className="atleta-preview-btn-back"
                    onClick={() => navigate(-1)}
                >
                    Volver Atrás
                </button>
            </div>
        </div>
    );
};

export default AtletaRutinaPreview;