import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const EditarResultados = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routineId = searchParams.get('id');

    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [valoresSeries, setValoresSeries] = useState({});
    const [executionIds, setExecutionIds] = useState({}); 

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
                        const inicialValores = {};
                        const inicialIds = {};

                        rutinaEspecifica.exercises?.forEach(ex => {
                            if (!blocksMap[ex.blockName]) {
                                blocksMap[ex.blockName] = { name: ex.blockName, exercises: [] };
                            }
                            blocksMap[ex.blockName].exercises.push(ex);

                            if (ex.executions && ex.executions.length > 0) {
                                ex.executions.forEach(exec => {
                                    const key = `${ex.id}-${exec.setNumber}`;
                                    inicialValores[key] = {
                                        reps: exec.actualReps || '',
                                        peso: exec.actualWeight || ''
                                    };
                                    inicialIds[key] = exec.id; 
                                });
                            } else {
                                for (let s = 1; s <= ex.sets; s++) {
                                    const key = `${ex.id}-${s}`;
                                    inicialValores[key] = { reps: '', peso: '' };
                                }
                            }
                        });
                        
                        setRoutine({ ...rutinaEspecifica, blocks: Object.values(blocksMap) });
                        setValoresSeries(inicialValores);
                        setExecutionIds(inicialIds);
                    }
                }
            } catch (err) {
                console.error("Error cargando la rutina para edición:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutineData();
    }, [routineId]);

    const handleInputChange = (exerciseId, setNum, field, value) => {
        const key = `${exerciseId}-${setNum}`;
        setValoresSeries(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleActualizarResultados = async () => {
        try {
            const updatePromises = [];
            
            Object.keys(valoresSeries).forEach(key => {
                const [exerciseId, setNum] = key.split('-');
                const currentReps = parseInt(valoresSeries[key].reps || 0);
                const currentPeso = parseFloat(valoresSeries[key].peso || 0);
                
                if (currentReps === 0 && currentPeso === 0) return;

                const currentRm = currentReps > 0 ? (currentPeso * (1 + 0.0333 * currentReps)) : 0;

                const payload = {
                    id: executionIds[key] || null, 
                    plannedExercise: { id: parseInt(exerciseId) },
                    setNumber: parseInt(setNum),
                    actualWeight: currentPeso,
                    actualReps: currentReps,
                    actualRpe: 7, 
                    estimatedRm: Math.round(currentRm)
                };
                
                updatePromises.push(
                    api.post('/executions/register', payload).catch(err => {
                        console.warn(`Error actualizando serie ${setNum} de ej ${exerciseId}`, err);
                    })
                );
            });

            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }

            alert("¡Resultados corregidos exitosamente!");
            navigate('/atleta');
        } catch (err) {
            console.error("Error al actualizar:", err);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    if (loading) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Cargando datos registrados...</p>;
    if (!routine) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No se pudo encontrar la rutina.</p>;

    return (
        <div className="atleta-run-container">
            <div className="atleta-run-header" style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>
                <button onClick={() => navigate(-1)} className="atleta-run-close-btn" style={{ color: '#854d0e' }}>✕</button>
                <div className="atleta-run-title-zone">
                    <span className="atleta-run-badge" style={{ backgroundColor: '#eab308', color: 'white' }}>MODO EDICIÓN</span>
                    <h2 className="atleta-run-routine-name">{routine.name}</h2>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#fffbeb', borderBottom: '1px solid #fde047', fontSize: '14px', color: '#854d0e' }}>
                💡 <strong>Corrige tus marcas:</strong> Modifica los pesos o repeticiones que anotaste mal y presiona "Actualizar" al final de la página.
            </div>

            <div className="atleta-block-content" style={{ marginTop: '20px' }}>
                {routine.blocks.map((block, bIdx) => (
                    <div key={bIdx} style={{ marginBottom: '30px' }}>
                        <h3 className="atleta-block-current-title" style={{ color: '#ca8a04' }}>{block.name}</h3>
                        
                        {block.exercises.map((ex) => (
                            <div key={ex.id} className="atleta-run-exercise-card" style={{ padding: '15px', border: '1px solid #fde047' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'var(--coach-text-dark)' }}>{ex.exercise?.name}</h4>
                                
                                <div className="atleta-run-sets-table">
                                    <div className="atleta-run-row header">
                                        <span>Serie</span>
                                        <span>Reps</span>
                                        <span>Peso (kg)</span>
                                    </div>

                                    {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                        const setNum = sIdx + 1;
                                        const key = `${ex.id}-${setNum}`;
                                        const valores = valoresSeries[key] || { reps: '', peso: '' };

                                        return (
                                            <div key={setNum} className="atleta-run-row">
                                                <span className="atleta-run-set-number">{setNum}</span>
                                                
                                                <input 
                                                    type="number"
                                                    value={valores.reps}
                                                    onChange={(e) => handleInputChange(ex.id, setNum, 'reps', e.target.value)}
                                                    className="atleta-run-input"
                                                    style={{ border: '1px solid #fde047' }}
                                                />
                                                
                                                <input 
                                                    type="number"
                                                    value={valores.peso}
                                                    onChange={(e) => handleInputChange(ex.id, setNum, 'peso', e.target.value)}
                                                    className="atleta-run-input"
                                                    style={{ border: '1px solid #fde047' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="atleta-run-footer-controls" style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <button 
                    onClick={handleActualizarResultados}
                    className="atleta-run-end-btn"
                    style={{ backgroundColor: '#eab308' }}
                >
                    💾 Guardar Correcciones
                </button>
            </div>
            <div className="atleta-spacer" />
        </div>
    );
};

export default EditarResultados;