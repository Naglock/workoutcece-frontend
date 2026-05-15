import { useState, useEffect } from 'react';
import api from '../services/api';
import { globalStyles, colors } from '../styles/globalStyles'; 

const PlanificadorRutina = ({ alumnoId, isTemplateMode = false, initialTemplate = null, onSaveSuccess }) => {
    const [exercisesLib, setExercisesLib] = useState([]);
    const [workout, setWorkout] = useState({
        name: '', scheduledDate: '', blocks: [{ blockName: 'Bloque A', exercises: [] }]
    });

    // Cargar biblioteca de ejercicios
    useEffect(() => {
        api.get('/exercises').then(res => setExercisesLib(res.data));
    }, []);

    // Cargar los datos si estamos editando una plantilla existente
    useEffect(() => {
        if (initialTemplate) {
            const blocksMap = {};
            
            // Agrupamos la lista plana de ejercicios en sus respectivos bloques
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
            // Si no hay plantilla inicial, limpiamos el formulario
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
                    // Si tiene ID, actualizamos la existente
                    await api.put(`/workouts/templates/${workout.id}`, payload);
                    alert("¡Plantilla actualizada con éxito!");
                } else {
                    // Si no tiene ID, creamos una nueva
                    await api.post('/workouts/create-template', payload);
                    alert("¡Plantilla guardada con éxito!");
                }
                
                if (onSaveSuccess) onSaveSuccess();

            } else {
                if(!workout.scheduledDate) return alert("Por favor, selecciona una fecha.");
                await api.post(`/workouts/create/${alumnoId}`, payload);
                alert("¡Planificación guardada con éxito!");
                setWorkout({name:'', scheduledDate:'', blocks: [{ blockName: 'Bloque A', exercises: [] }]});
            }
            
        } catch (err) {
            console.error(err);
            alert("Error al guardar la rutina.");
        }
    };

    return (
        <div style={{ marginTop: '10px' }}>
            <div style={localStyles.topControls}>
                <div style={{ flex: 2 }}>
                    <label style={globalStyles.label}>Nombre de la Rutina/Plantilla</label>
                    <input type="text" placeholder="Ej: Fuerza Máxima Centrales" 
                        value={workout.name} onChange={e => setWorkout({...workout, name: e.target.value})} style={{...globalStyles.input, marginTop: '5px'}}/>
                </div>
                
                {!isTemplateMode && (
                    <div style={{ flex: 1 }}>
                        <label style={globalStyles.label}>Fecha de Ejecución</label>
                        <input type="date" 
                            value={workout.scheduledDate} onChange={e => setWorkout({...workout, scheduledDate: e.target.value})} style={{...globalStyles.input, marginTop: '5px'}}/>
                    </div>
                )}
            </div>

            {workout.blocks.map((block, blockIndex) => (
                <div key={blockIndex} style={localStyles.blockCard}>
                    <div style={localStyles.blockHeader}>
                        <input type="text" value={block.blockName} style={localStyles.blockTitleInput}
                            onChange={e => {
                                const newBlocks = [...workout.blocks];
                                newBlocks[blockIndex].blockName = e.target.value;
                                setWorkout({...workout, blocks: newBlocks});
                            }}
                        />
                        <button onClick={() => removeBlock(blockIndex)} style={localStyles.deleteBlockBtn} title="Eliminar Bloque Completo">
                            🗑️ Eliminar Bloque
                        </button>
                    </div>

                    <div style={localStyles.tableWrapper}> 
                        <table style={localStyles.table}>
                            <thead>
                                <tr>
                                    <th style={localStyles.th}>Ejercicio</th>
                                    <th style={localStyles.th}>RM Base</th>
                                    <th style={localStyles.th}>% Int.</th>
                                    <th style={localStyles.th}>Auto</th>
                                    <th style={localStyles.th}>Manual</th>
                                    <th style={localStyles.th}>Sets</th>
                                    <th style={localStyles.th}>Reps</th>
                                    <th style={localStyles.th}>RPE</th>
                                    <th style={localStyles.th}>Descanso</th>
                                    <th style={localStyles.th}>Notas</th>
                                    <th style={localStyles.th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.exercises.map((ex, exIndex) => (
                                    <tr key={exIndex} style={localStyles.tr}>
                                        <td style={localStyles.td}>
                                            <select style={{...globalStyles.input, padding: '8px', minWidth: '160px'}} value={ex.exercise.id} 
                                                onChange={e => handleExerciseChange(blockIndex, exIndex, e.target.value)}>
                                                <option value="">Seleccionar...</option>
                                                {exercisesLib.map(lib => <option key={lib.id} value={lib.id}>{lib.name}</option>)}
                                            </select>
                                        </td>
                                        <td style={localStyles.td}>
                                            <div style={localStyles.rmText}>{ex._baseRm > 0 ? `${ex._baseRm} kg` : '--'}</div>
                                        </td>
                                        <td style={localStyles.td}><input type="number" placeholder="%" value={ex.intensityPercentage || ''} style={globalStyles.inputMini} onChange={e => handleIntensityChange(blockIndex, exIndex, e.target.value)}/></td>
                                        <td style={localStyles.td}><input type="number" placeholder="kg" disabled value={ex.targetWeight || ''} style={globalStyles.inputDisabled}/></td>
                                        <td style={localStyles.td}><input type="number" placeholder="kg" value={ex.manualWeightOverride || ''} style={globalStyles.inputMini}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].manualWeightOverride = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}><input type="number" value={ex.sets} style={globalStyles.inputTiny}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].sets = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}><input type="number" value={ex.reps} style={globalStyles.inputTiny}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].reps = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}><input type="number" value={ex.targetRpe} style={globalStyles.inputTiny}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].targetRpe = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}><input type="text" placeholder="90s" value={ex.restTime || ''} style={globalStyles.inputTiny}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].restTime = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}><input type="text" placeholder="Tips..." value={ex.notes || ''} style={{...globalStyles.input, padding: '8px', minWidth: '130px'}}
                                                onChange={e => {
                                                    const newBlocks = [...workout.blocks];
                                                    newBlocks[blockIndex].exercises[exIndex].notes = e.target.value;
                                                    setWorkout({...workout, blocks: newBlocks});
                                                }}/></td>
                                        <td style={localStyles.td}>
                                            <button onClick={() => removeExerciseFromBlock(blockIndex, exIndex)} style={localStyles.deleteExBtn} title="Quitar Ejercicio">
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <button onClick={() => addExerciseToBlock(blockIndex)} style={{...globalStyles.btnOutline, marginTop: '20px'}}>
                        + Añadir Ejercicio a {block.blockName}
                    </button>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <button onClick={addBlock} style={{...globalStyles.btnPrimary, backgroundColor: colors.textMuted}}>
                    + Añadir Nuevo Bloque
                </button>
                <div style={{display: 'flex', gap: '15px'}}>
                    {isTemplateMode ? (
                        <button onClick={() => handleSave(true)} style={{...globalStyles.btnSuccess, width: 'auto', padding: '12px 30px'}}>
                            {workout.id ? '💾 Actualizar Plantilla' : '💾 Guardar Plantilla'}
                        </button>
                    ) : (
                        <button onClick={() => handleSave(false)} style={{...globalStyles.btnSuccess, width: 'auto', padding: '12px 30px'}}>
                            🚀 Asignar Planificación
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const localStyles = {
    topControls: { display: 'flex', gap: '20px', marginBottom: '30px', backgroundColor: colors.surface, padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    blockCard: { backgroundColor: colors.surface, padding: '25px', borderRadius: '12px', marginBottom: '25px', borderLeft: `6px solid ${colors.primary}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    blockHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: `1px solid ${colors.border}` },
    blockTitleInput: { fontSize: '20px', fontWeight: 'bold', color: colors.textDark, border: 'none', borderBottom: `2px dashed ${colors.border}`, padding: '5px 10px', width: '300px', outline: 'none', backgroundColor: '#f8fafc', borderRadius: '6px' },
    deleteBlockBtn: { backgroundColor: '#fee2e2', color: colors.danger, border: `1px solid #fca5a5`, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
    
    tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: `1px solid ${colors.border}` },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '1000px', backgroundColor: 'white' },
    th: { padding: '15px 10px', backgroundColor: '#f8fafc', color: '#475569', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', borderBottom: `2px solid ${colors.border}` },
    tr: { transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f1f5f9' } },
    td: { padding: '12px 10px', verticalAlign: 'middle', borderBottom: `1px solid #e2e8f0` },
    
    rmText: { fontWeight: 'bold', color: colors.primary, fontSize: '15px', backgroundColor: '#eff6ff', padding: '6px', borderRadius: '6px', display: 'inline-block', minWidth: '60px' },
    deleteExBtn: { background: '#fee2e2', color: colors.danger, border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', fontWeight: 'bold', transition: 'all 0.2s' }
};

export default PlanificadorRutina;