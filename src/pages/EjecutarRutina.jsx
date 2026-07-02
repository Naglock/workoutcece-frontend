import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';
import { WorkoutSessionContext } from '../components/AtletaLayout';

const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const EjecutarRutina = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routineId = searchParams.get('id');

    const navContext = useContext(WorkoutSessionContext);
    const setIsWorkoutActive = navContext?.setIsWorkoutActive;
    const setOnSaveDraftCallback = navContext?.setOnSaveDraftCallback;

    const saveDraftRef = useRef(null);

    const [tiempo, setTiempo] = useState(0);
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [seriesCompletadas, setSeriesCompletadas] = useState({});
    const [valoresSeries, setValoresSeries] = useState({});
    const [notasEjercicios, setNotasEjercicios] = useState({});
    
    const [expandedExercises, setExpandedExercises] = useState({});
    
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [rpe, setRpe] = useState(7);
    const [comentarios, setComentarios] = useState('');

    const handleSaveDraft = async () => {
        try {
            const savePromises = [];
            Object.keys(seriesCompletadas).forEach(key => {
                if (seriesCompletadas[key]) { 
                    const [exerciseId, setNum] = key.split('-');
                    
                    const currentReps = parseInt(valoresSeries[key].reps || 0);
                    const currentPeso = parseFloat(valoresSeries[key].peso || 0);
                    const currentRm = currentReps > 0 ? (currentPeso * (1 + 0.0333 * currentReps)) : 0;

                    const payload = {
                        plannedExercise: { id: parseInt(exerciseId) },
                        setNumber: parseInt(setNum),
                        actualWeight: currentPeso,
                        actualReps: currentReps,
                        actualRpe: parseInt(rpe) || 5,
                        athleteNotes: notasEjercicios[exerciseId] || '',
                        estimatedRm: Math.round(currentRm)
                    };
                    
                    savePromises.push(
                        api.post('/executions/register', payload).catch(err => {})
                    );
                }
            });

            if (savePromises.length > 0) {
                await Promise.all(savePromises);
            }

            await api.put(`/workouts/${routineId}/pause?time=${Math.max(1, Math.round(tiempo/60))}`);
        } catch (error) {}
    };

    useEffect(() => {
        saveDraftRef.current = handleSaveDraft;
    });

    useEffect(() => {
        if (setIsWorkoutActive && setOnSaveDraftCallback) {
            setIsWorkoutActive(true);
            setOnSaveDraftCallback(() => async () => {
                if (saveDraftRef.current) {
                    await saveDraftRef.current();
                }
            });
        }

        return () => {
            if (setIsWorkoutActive && setOnSaveDraftCallback) {
                setIsWorkoutActive(false);
                setOnSaveDraftCallback(null);
            }
        };
    }, [setIsWorkoutActive, setOnSaveDraftCallback]);

    useEffect(() => {
        const fetchRoutineData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId || decoded.id;

                if (alumnoId && routineId) {
                    const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                    const rutinaEspecifica = response.data.find(r => parseInt(r.id) === parseInt(routineId));

                    if (rutinaEspecifica) {
                        if (rutinaEspecifica.estado === 'PAUSADA' && rutinaEspecifica.executionTimeMinutes) {
                            setTiempo(rutinaEspecifica.executionTimeMinutes * 60);
                        }

                        const blocksMap = {};
                        rutinaEspecifica.exercises?.forEach(ex => {
                            if (!blocksMap[ex.blockName]) {
                                blocksMap[ex.blockName] = { name: ex.blockName, exercises: [] };
                            }
                            blocksMap[ex.blockName].exercises.push(ex);
                        });
                        
                        setRoutine({ ...rutinaEspecifica, blocks: Object.values(blocksMap) });

                        let ejecucionesPrevias = [];
                        try {
                            const execRes = await api.get(`/executions/workout/${routineId}`);
                            ejecucionesPrevias = execRes.data || [];
                        } catch (e) {
                            ejecucionesPrevias = [];
                        }

                        const inicialCompletadas = {};
                        const inicialValores = {};
                        const inicialExpanded = {};
                        const inicialNotas = {};
                        
                        rutinaEspecifica.exercises?.forEach((ex) => {
                            inicialExpanded[ex.id] = false;

                            for (let s = 1; s <= ex.sets; s++) {
                                const key = `${ex.id}-${s}`;
                                
                                const ejecucionGuardada = ejecucionesPrevias.find(
                                    ej => parseInt(ej.plannedExercise?.id) === parseInt(ex.id) && parseInt(ej.setNumber) === parseInt(s)
                                );

                                if (ejecucionGuardada) {
                                    inicialCompletadas[key] = true;
                                    inicialValores[key] = {
                                        reps: ejecucionGuardada.actualReps,
                                        peso: ejecucionGuardada.actualWeight
                                    };
                                    if (!inicialNotas[ex.id] && ejecucionGuardada.athleteNotes) {
                                        inicialNotas[ex.id] = ejecucionGuardada.athleteNotes;
                                    }
                                } else {
                                    inicialCompletadas[key] = false;
                                    inicialValores[key] = {
                                        reps: ex.reps,
                                        peso: ex.manualWeightOverride || ex.targetWeight || 0
                                    };
                                }
                            }
                        });
                        
                        setSeriesCompletadas(inicialCompletadas);
                        setValoresSeries(inicialValores);
                        setExpandedExercises(inicialExpanded);
                        setNotasEjercicios(inicialNotas);
                    }
                }
            } catch (err) {
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

    const toggleExpand = (id) => {
        setExpandedExercises(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSerie = (workoutExerciseId, setNum) => {
        const key = `${workoutExerciseId}-${setNum}`;
        setSeriesCompletadas(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (exerciseId, setNum, field, value) => {
        if (value !== '' && Number(value) < 0) {
            return;
        }

        const key = `${exerciseId}-${setNum}`;
        setValoresSeries(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleIntentarTerminar = () => {
        const faltanSeries = Object.values(seriesCompletadas).some(estado => estado === false);
        if (faltanSeries) {
            const confirmar = window.confirm("Aún tienes series sin marcar con el Check ✓. ¿Estás seguro de que deseas terminar la sesión?");
            if (!confirmar) return; 
        }
        setMostrarFeedback(true);
    };

    const handleFinalizarEntrenamiento = async () => {
        try {
            const savePromises = [];
            
            Object.keys(seriesCompletadas).forEach(key => {
                if (seriesCompletadas[key]) { 
                    const [exerciseId, setNum] = key.split('-');
                    
                    const currentReps = parseInt(valoresSeries[key].reps || 0);
                    const currentPeso = parseFloat(valoresSeries[key].peso || 0);
                    
                    const currentRm = currentReps > 0 ? (currentPeso * (1 + 0.0333 * currentReps)) : 0;

                    const payload = {
                        plannedExercise: { id: parseInt(exerciseId) },
                        setNumber: parseInt(setNum),
                        actualWeight: currentPeso,
                        actualReps: currentReps,
                        actualRpe: parseInt(rpe),
                        athleteNotes: notasEjercicios[exerciseId] || '',
                        estimatedRm: Math.round(currentRm)
                    };
                    
                    savePromises.push(
                        api.post('/executions/register', payload).catch(err => {})
                    );
                }
            });

            if (savePromises.length > 0) {
                await Promise.all(savePromises);
            }

            const minutosTotales = Math.max(1, Math.round(tiempo/60));

            await api.put(`/workouts/${routineId}/complete?time=${minutosTotales}&rpe=${rpe}&notes=${encodeURIComponent(comentarios)}`);

            alert("¡Sesión concluida! El detalle de cada una de tus series ha sido registrado.");
            navigate('/atleta');
        } catch (err) {
            alert("Hubo un error al guardar los datos.");
        }
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
                <button onClick={() => navContext ? navContext.handleNavigation('/atleta') : navigate(-1)} className="atleta-run-close-btn">✕</button>
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
                
                {currentBlock.exercises.map((ex) => {
                    const videoId = extractYouTubeId(ex.exercise?.videoUrl);
                    const isExpanded = expandedExercises[ex.id];

                    return (
                        <div key={ex.id} className="atleta-run-exercise-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div 
                                className="atleta-preview-item" 
                                onClick={() => toggleExpand(ex.id)}
                                style={{ 
                                    cursor: 'pointer', 
                                    border: 'none', 
                                    borderRadius: '0',
                                    backgroundColor: isExpanded ? '#f8fafc' : 'white'
                                }}
                            >
                                {videoId && (
                                    <a 
                                        href={ex.exercise.videoUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="atleta-preview-video-square"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img 
                                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                            alt={ex.exercise?.name} 
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

                                <div className="atleta-expand-icon">
                                    {isExpanded ? '▲' : '▼'}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="atleta-run-expanded-area">
                                    {ex.notes && <p className="atleta-run-exercise-notes">💡 {ex.notes}</p>}
                                    
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
                                                        min="0"
                                                        value={valores.reps}
                                                        onChange={(e) => handleInputChange(ex.id, setNum, 'reps', e.target.value)}
                                                        className="atleta-run-input"
                                                        disabled={isDone}
                                                    />
                                                    
                                                    <input 
                                                        type="number"
                                                        min="0"
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
                                    
                                    <div style={{ marginTop: '15px' }}>
                                        <textarea 
                                            placeholder="Añadir comentario personal sobre este ejercicio..."
                                            value={notasEjercicios[ex.id] || ''}
                                            onChange={(e) => setNotasEjercicios(prev => ({...prev, [ex.id]: e.target.value}))}
                                            style={{ 
                                                width: '100%', 
                                                minHeight: '60px', 
                                                padding: '10px', 
                                                fontSize: '14px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #cbd5e1', 
                                                resize: 'vertical' 
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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
                        onClick={handleIntentarTerminar}
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