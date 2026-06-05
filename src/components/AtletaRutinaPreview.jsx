import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

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

    if (loading) return <p className="atleta-loading-text">Cargando resumen de sesión...</p>;
    if (!routine) return <p className="atleta-loading-text">Rutina no encontrada.</p>;

    const ejerciciosAgrupados = routine.exercises?.reduce((acc, ex) => {
        const bloque = ex.blockName || 'Sin Bloque Asignado';
        if (!acc[bloque]) {
            acc[bloque] = [];
        }
        acc[bloque].push(ex);
        return acc;
    }, {});

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
                <h3 className="atleta-section-title">Estructura del Entrenamiento:</h3>
                
                {ejerciciosAgrupados && Object.entries(ejerciciosAgrupados).map(([nombreBloque, ejercicios], indexBloque) => (
                    <div key={indexBloque} className="atleta-preview-block-group">
                        <div className="atleta-block-divider">
                            <span className="atleta-block-title">{nombreBloque}</span>
                            <div className="atleta-block-line"></div>
                        </div>

                        <div className="atleta-preview-list">
                            {ejercicios.map((ex, idx) => {
                                const videoId = extractYouTubeId(ex.exercise?.videoUrl);
                                return (
                                    <div key={idx} className="atleta-preview-item">
                                        {videoId && (
                                            <a 
                                                href={ex.exercise.videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="atleta-preview-video-square"
                                            >
                                                <img 
                                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                                    alt={`Video de ${ex.exercise?.name}`} 
                                                />
                                                <div className="atleta-video-play-icon-small">▶</div>
                                            </a>
                                        )}
                                        
                                        <div className="atleta-preview-item-info">
                                            <h4>{ex.exercise?.name}</h4>
                                            <p>
                                                {ex.sets} series x {ex.reps} reps 
                                                {ex.targetRpe ? ` • RPE: ${ex.targetRpe}` : ''}
                                                {ex.targetWeight > 0 
                                                    ? ` • ${ex.targetWeight} kg` 
                                                    : (ex.intensityPercentage > 0 ? ` • ${ex.intensityPercentage}%` : '')}
                                                {ex.restTime ? ` • ⏱️ ${ex.restTime}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
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