import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const EjecutarRutina = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routineId = searchParams.get('id');

    const [tiempo, setTiempo] = useState(0);
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [seriesCompletadas, setSeriesCompletadas] = useState({});
    const [valoresSeries, setValoresSeries] = useState({});
    
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [rpe, setRpe] = useState(7);
    const [comentarios, setComentarios] = useState('');

    useEffect(() => {
        const fetchRoutineData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId || decoded.id;

                if (alumnoId && routineId) {
                    const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                    const rutinaEspecifica = response.data.find(r => r.id === parseInt(routineId));

                    if (rutinaEspecifica) {
                        const blocksMap = {};
                        rutinaEspecifica.exercises?.forEach(ex => {
                            if (!blocksMap[ex.blockName]) {
                                blocksMap[ex.blockName] = { name: ex.blockName, exercises: [] };
                            }
                            blocksMap[ex.blockName].exercises.push(ex);
                        });
                        
                        setRoutine({ ...rutinaEspecifica, blocks: Object.values(blocksMap) });

                        const inicialCompletadas = {};
                        const inicialValores = {};
                        rutinaEspecifica.exercises?.forEach(ex => {
                            for (let s = 1; s <= ex.sets; s++) {
                                const key = `${ex.id}-${s}`;
                                inicialCompletadas[key] = false;
                                inicialValores[key] = {
                                    reps: ex.reps,
                                    peso: ex.manualWeightOverride || ex.targetWeight || 0
                                };
                            }
                        });
                        setSeriesCompletadas(inicialCompletadas);
                        setValoresSeries(inicialValores);
                    }
                }
            } catch (err) {
                console.error("Error cargando la rutina de ejecución:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutineData();
    }, [routineId]);

    useEffect(() => {
        if (loading || mostrarFeedback) return;
        const timer = setInterval(() => setTiempo(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, [loading, mostrarFeedback]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleSerie = async (workoutExerciseId, setNum) => {
        const key = `${workoutExerciseId}-${setNum}`;
        const yaCompletado = seriesCompletadas[key];

        if (!yaCompletado) {
            try {
                const valores = valoresSeries[key];
                const payload = {
                    plannedExercise: { id: parseInt(workoutExerciseId) },
                    actualWeight: parseFloat(valores.peso || 0),
                    actualReps: parseInt(valores.reps || 0),
                    actualRpe: parseInt(rpe)
                };

                await api.post('/api/executions/register', payload);
                setSeriesCompletadas(prev => ({ ...prev, [key]: true }));
            } catch (err) {
                console.error("Error al registrar ejecución de serie:", err);
                alert("No se pudo guardar la serie actual en el servidor.");
            }
        } else {
            setSeriesCompletadas(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleInputChange = (exerciseId, setNum, field, value) => {
        const key = `${exerciseId}-${setNum}`;
        setValoresSeries(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleFinalizarEntrenamiento = () => {
        alert("¡Sesión concluida! Todas tus series ejecutadas han sido registradas.");
        navigate('/atleta');
    };

    if (loading) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Iniciando panel de entrenamiento...</p>;
    if (!routine || !routine.blocks || routine.blocks.length === 0) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No se pudo encontrar la rutina seleccionada.</p>;

    const currentBlock = routine.blocks[currentBlockIndex];

    if (mostrarFeedback) {
        return (
            <div className="atleta-feedback-container">
                <div className="atleta-feedback-header">
                    <h2>Buen entrenamiento</h2>
                    <p>Registra tus sensaciones finales de la sesión</p>
                </div>

                <div className="atleta-feedback-card">
                    <span className="atleta-feedback-summary-title">Resumen de sesión</span>
                    <div className="atleta-feedback-row">
                        <span>Tiempo total:</span>
                        <strong>{formatTime(tiempo)} min</strong>
                    </div>
                </div>

                <div className="atleta-feedback-card">
                    <label className="atleta-feedback-label">Valoración promedio del esfuerzo (RPE)</label>
                    <div className="atleta-rpe-display">
                        <span className="atleta-rpe-number">{rpe}</span>
                        <span className="atleta-rpe-text">
                            {rpe <= 4 ? 'Esfuerzo ligero' : rpe <= 6 ? 'Moderado' : rpe <= 8 ? 'Fuerte / Duro' : 'Esfuerzo máximo'}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={rpe} 
                        onChange={(e) => setRpe(e.target.value)}
                        className="atleta-rpe-slider"
                    />
                </div>

                <div className="atleta-feedback-card">
                    <label className="atleta-feedback-label">Notas generales de la sesión</label>
                    <textarea 
                        placeholder="Comentarios sobre molestias, dolores o sensaciones generales..."
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        className="atleta-feedback-textarea"
                    />
                </div>

                <div className="atleta-feedback-actions">
                    <button onClick={() => setMostrarFeedback(false)} className="atleta-feedback-back-btn">
                        Volver a los bloques
                    </button>
                    <button onClick={handleFinalizarEntrenamiento} className="atleta-feedback-submit-btn">
                        Cerrar Entrenamiento ✓
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="atleta-run-container">
            <div className="atleta-run-header">
                <button onClick={() => navigate(-1)} className="atleta-run-close-btn">✕</button>
                <div className="atleta-run-title-zone">
                    <span className="atleta-run-badge">EN CURSO</span>
                    <h2 className="atleta-run-routine-name">{routine.name}</h2>
                </div>
                <div className="atleta-run-timer">⏱ {formatTime(tiempo)}</div>
            </div>

            <div className="atleta-block-selector">
                {routine.blocks.map((b, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentBlockIndex(idx)}
                        className={`atleta-block-tab ${idx === currentBlockIndex ? 'active' : ''}`}
                    >
                        {b.name}
                    </button>
                ))}
            </div>

            <div className="atleta-block-content">
                <h3 className="atleta-block-current-title">Trabajo en {currentBlock.name}</h3>
                
                {currentBlock.exercises.map((ex) => (
                    <div key={ex.id} className="atleta-run-exercise-card">
                        <div className="atleta-run-exercise-info">
                            <h4 className="atleta-run-exercise-name">{ex.exercise?.name}</h4>
                            {ex.notes && <p className="atleta-run-exercise-notes">💡 {ex.notes}</p>}
                            {ex.restTime && <span className="atleta-run-exercise-rest">⏱ Descanso: {ex.restTime}</span>}
                        </div>

                        <div className="atleta-run-sets-table">
                            <div className="atleta-run-row header">
                                <span>Serie</span>
                                <span>Reps</span>
                                <span>Peso (kg)</span>
                                <span>Check</span>
                            </div>

                            {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                const setNum = sIdx + 1;
                                const key = `${ex.id}-${setNum}`;
                                const isDone = seriesCompletadas[key];
                                const valores = valoresSeries[key] || { reps: ex.reps, peso: '' };

                                return (
                                    <div key={setNum} className={`atleta-run-row ${isDone ? 'completed' : ''}`}>
                                        <span className="atleta-run-set-number">{setNum}</span>
                                        
                                        <input 
                                            type="number"
                                            value={valores.reps}
                                            onChange={(e) => handleInputChange(ex.id, setNum, 'reps', e.target.value)}
                                            className="atleta-run-input"
                                            disabled={isDone}
                                        />
                                        
                                        <input 
                                            type="number"
                                            value={valores.peso}
                                            onChange={(e) => handleInputChange(ex.id, setNum, 'peso', e.target.value)}
                                            className="atleta-run-input"
                                            disabled={isDone}
                                        />
                                        
                                        <button 
                                            onClick={() => toggleSerie(ex.id, setNum)}
                                            className={`atleta-run-check-btn ${isDone ? 'checked' : ''}`}
                                        >
                                            ✓
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="atleta-run-footer-controls">
                {currentBlockIndex < routine.blocks.length - 1 ? (
                    <button 
                        onClick={() => setCurrentBlockIndex(currentBlockIndex + 1)}
                        className="atleta-run-next-btn"
                    >
                        Siguiente Bloque ▶
                    </button>
                ) : (
                    <button 
                        onClick={() => setMostrarFeedback(true)}
                        className="atleta-run-end-btn"
                    >
                        Terminar Sesión 🏁
                    </button>
                )}
            </div>
            <div className="atleta-spacer" />
        </div>
    );
};

export default EjecutarRutina;