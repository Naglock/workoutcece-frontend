import { useState, useEffect } from 'react';
import api from '../services/api';

const PlanificadorRutina = ({ alumnoId, isTemplateMode = false, initialTemplate = null, onSaveSuccess }) => {
    const [exercisesLib, setExercisesLib] = useState([]);
    const [workout, setWorkout] = useState({
        name: '', scheduledDate: '', blocks: [{ blockName: 'Bloque A', exercises: [] }]
    });

    useEffect(() => {
        api.get('/exercises').then(res => setExercisesLib(res.data));
    }, []);

    useEffect(() => {
        if (initialTemplate) {
            const blocksMap = {};
            
            initialTemplate.exercises?.forEach(ex => {
                if (!blocksMap[ex.blockName]) {
                    blocksMap[ex.blockName] = { blockName: ex.blockName, exercises: [] };
                }
                blocksMap[ex.blockName].exercises.push({
                    ...ex,
                    exercise: { id: ex.exercise?.id || '' },
                    _baseRm: 0 
                });
            });
            
            const formattedBlocks = Object.values(blocksMap);
            
            setWorkout({
                id: initialTemplate.id,
                name: initialTemplate.name,
                scheduledDate: initialTemplate.scheduledDate || '',
                blocks: formattedBlocks.length > 0 ? formattedBlocks : [{ blockName: 'Bloque A', exercises: [] }]
            });
        } else {
            setWorkout({ name: '', scheduledDate: '', blocks: [{ blockName: 'Bloque A', exercises: [] }] });
        }
    }, [initialTemplate]);

    const addBlock = () => {
        const nextChar = String.fromCharCode(65 + workout.blocks.length);
        setWorkout({
            ...workout,
            blocks: [...workout.blocks, { blockName: `Bloque ${nextChar}`, exercises: [] }]
        });
    };

    const removeBlock = (blockIndexToRemove) => {
        const newBlocks = workout.blocks.filter((_, index) => index !== blockIndexToRemove);
        setWorkout({ ...workout, blocks: newBlocks });
    };

    const addExerciseToBlock = (blockIndex) => {
        const newBlocks = [...workout.blocks];
        newBlocks[blockIndex].exercises.push({ 
            exercise: { id: '' }, sets: 3, reps: 10, intensityPercentage: '', 
            targetWeight: '', manualWeightOverride: '', targetRpe: 7, 
            restTime: '90s', notes: '', _baseRm: 0 
        });
        setWorkout({...workout, blocks: newBlocks});
    };

    const removeExerciseFromBlock = (blockIndex, exIndexToRemove) => {
        const newBlocks = [...workout.blocks];
        newBlocks[blockIndex].exercises = newBlocks[blockIndex].exercises.filter((_, idx) => idx !== exIndexToRemove);
        setWorkout({...workout, blocks: newBlocks});
    };

    const handleExerciseChange = async (blockIndex, exIndex, exerciseId) => {
        const newBlocks = [...workout.blocks];
        const ex = newBlocks[blockIndex].exercises[exIndex];
        ex.exercise.id = exerciseId;

        if (exerciseId && alumnoId) {
            try {
                const res = await api.get(`/analytics/rm-progress/${alumnoId}/${exerciseId}`);
                const rmData = res.data;
                let latestRm = 0;
                
                if (Array.isArray(rmData) && rmData.length > 0) {
                    latestRm = rmData[rmData.length - 1].estimatedRm || rmData[rmData.length - 1].lastEstimatedRm;
                } else if (rmData && rmData.lastEstimatedRm) {
                    latestRm = rmData.lastEstimatedRm;
                }

                ex._baseRm = latestRm; 
                if (ex.intensityPercentage && latestRm > 0) {
                    ex.targetWeight = (latestRm * (ex.intensityPercentage / 100)).toFixed(1);
                }
            } catch (err) { ex._baseRm = 0; }
        } else {
            ex._baseRm = 0;
            ex.targetWeight = '';
        }
        setWorkout({...workout, blocks: newBlocks});
    };

    const handleIntensityChange = (blockIndex, exIndex, percentage) => {
        const newBlocks = [...workout.blocks];
        const ex = newBlocks[blockIndex].exercises[exIndex];
        ex.intensityPercentage = percentage;
        if (ex._baseRm && ex._baseRm > 0) {
            ex.targetWeight = (ex._baseRm * (percentage / 100)).toFixed(1);
        }
        setWorkout({...workout, blocks: newBlocks});
    };

    const handleSave = async (asTemplate = false) => {
        if (!workout.name) return alert("Por favor, ingresa el nombre de la rutina.");
        try {
            const flatExercises = workout.blocks.flatMap(block => 
                block.exercises.map(({ _baseRm, ...rest }) => ({
                    ...rest, blockName: block.blockName 
                }))
            );

            const payload = {
                name: workout.name,
                scheduledDate: asTemplate ? null : workout.scheduledDate,
                exercises: flatExercises,
                template: asTemplate 
            };

            if (asTemplate) {
                if (workout.id) {
                    await api.put(`/workouts/templates/${workout.id}`, payload);
                    alert("¡Plantilla actualizada con éxito!");
                } else {
                    await api.post('/workouts/create-template', payload);
                    alert("¡Plantilla guardada con éxito!");
                }
                if (onSaveSuccess) onSaveSuccess();
            } else {
                if(!workout.scheduledDate) return alert("Por favor, selecciona una fecha.");
                
                if (workout.id) {
                    await api.put(`/workouts/${workout.id}`, payload);
                    alert("¡Planificación actualizada con éxito!");
                    if (onSaveSuccess) onSaveSuccess();
                } else {
                    await api.post(`/workouts/create/${alumnoId}`, payload);
                    alert("¡Planificación guardada con éxito!");
                    setWorkout({name:'', scheduledDate:'', blocks: [{ blockName: 'Bloque A', exercises: [] }]});
                    if (onSaveSuccess) onSaveSuccess();
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error al guardar la rutina.");
        }
    };

    return (
        <div>
            <div className="coach-planner-top">
                <div style={{ flex: 2 }}>
                    <label className="coach-label">Nombre de la Rutina/Plantilla</label>
                    <input type="text" placeholder="Ej: Fuerza Máxima Centrales" 
                        value={workout.name} onChange={e => setWorkout({...workout, name: e.target.value})} className="coach-input"/>
                </div>
                
                {!isTemplateMode && (
                    <div style={{ flex: 1 }}>
                        <label className="coach-label">Fecha de Ejecución</label>
                        <input type="date" value={workout.scheduledDate} onChange={e => setWorkout({...workout, scheduledDate: e.target.value})} className="coach-input"/>
                    </div>
                )}
            </div>

            {workout.blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="coach-card" style={{ borderLeft: '6px solid var(--coach-primary)' }}>
                    <div className="coach-planner-block-header">
                        <input type="text" value={block.blockName} className="coach-planner-block-title-input"
                            onChange={e => {
                                const newBlocks = [...workout.blocks];
                                newBlocks[blockIndex].blockName = e.target.value;
                                setWorkout({...workout, blocks: newBlocks});
                            }}
                        />
                        <button onClick={() => removeBlock(blockIndex)} className="coach-btn coach-btn-danger">
                            🗑️ Eliminar Bloque
                        </button>
                    </div>

                    <div className="coach-table-container"> 
                        <table className="coach-table">
                            <thead>
                                <tr>
                                    <th>Ejercicio</th>
                                    <th>RM Base</th>
                                    <th>% Int.</th>
                                    <th>Auto</th>
                                    <th>Manual</th>
                                    <th>Sets</th>
                                    <th>Reps</th>
                                    <th>RPE</th>
                                    <th>Descanso</th>
                                    <th>Notas</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.exercises.map((ex, exIndex) => (
                                    <tr key={exIndex}>
                                        <td>
                                            <select className="coach-select" style={{ minWidth: '160px' }} value={ex.exercise.id} 
                                                onChange={e => handleExerciseChange(blockIndex, exIndex, e.target.value)}>
                                                <option value="">Seleccionar...</option>
                                                {exercisesLib.map(lib => <option key={lib.id} value={lib.id}>{lib.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <span className="coach-planner-rm-badge">{ex._baseRm > 0 ? `${ex._baseRm} kg` : '--'}</span>
                                        </td>
                                        <td><input type="number" placeholder="%" value={ex.intensityPercentage || ''} className="coach-input" style={{ width: '65px', textAlign: 'center' }} onChange={e => handleIntensityChange(blockIndex, exIndex, e.target.value)}/></td>
                                        <td><input type="number" placeholder="kg" disabled value={ex.targetWeight || ''} className="coach-input" style={{ width: '75px', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#64748b' }}/></td>
                                        <td><input type="number" placeholder="kg" value={ex.manualWeightOverride || ''} className="coach-input" style={{ width: '75px', textAlign: 'center' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].manualWeightOverride = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td><input type="number" value={ex.sets} className="coach-input" style={{ width: '55px', textAlign: 'center' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].sets = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td><input type="number" value={ex.reps} className="coach-input" style={{ width: '55px', textAlign: 'center' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].reps = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td><input type="number" value={ex.targetRpe} className="coach-input" style={{ width: '55px', textAlign: 'center' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].targetRpe = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td><input type="text" placeholder="90s" value={ex.restTime || ''} className="coach-input" style={{ width: '65px', textAlign: 'center' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].restTime = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td><input type="text" placeholder="Tips..." value={ex.notes || ''} className="coach-input" style={{ minWidth: '130px' }}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].notes = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td>
                                            <button onClick={() => removeExerciseFromBlock(blockIndex, exIndex)} className="coach-planner-delete-ex-btn" title="Quitar Ejercicio">
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <button onClick={() => addExerciseToBlock(blockIndex)} className="coach-btn coach-btn-outline" style={{ marginTop: '20px' }}>
                        + Añadir Ejercicio a {block.blockName}
                    </button>
                </div>
            ))}

            <div className="coach-planner-footer-actions">
                <button onClick={addBlock} className="coach-btn coach-btn-outline">
                    + Añadir Nuevo Bloque
                </button>
                <div>
                    {isTemplateMode ? (
                        <button onClick={() => handleSave(true)} className="coach-btn coach-btn-success" style={{ padding: '12px 30px' }}>
                            {workout.id ? '💾 Actualizar Plantilla' : '💾 Guardar Plantilla'}
                        </button>
                    ) : (
                        <button onClick={() => handleSave(false)} className="coach-btn coach-btn-success" style={{ padding: '12px 30px' }}>
                            {workout.id ? '💾 Actualizar Planificación' : '🚀 Asignar Planificación'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanificadorRutina;