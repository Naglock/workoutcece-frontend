import { useState, useEffect } from 'react';
import api from '../services/api';
import PlanificadorRutina from './PlanificadorRutina';

const HistorialRutinas = ({ alumnoId }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rutinaEnEdicion, setRutinaEnEdicion] = useState(null);
    const [mostrarEditor, setMostrarEditor] = useState(false);
    
    const [rutinasExpandidas, setRutinasExpandidas] = useState({});

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/workouts/my-routine/${alumnoId}`);
            const rutinasOrdenadas = response.data.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
            setWorkouts(rutinasOrdenadas);
        } catch (err) {
            console.error("Error al cargar el historial:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (alumnoId) fetchHistorial();
    }, [alumnoId]);

    const handleEditarClic = (workout, e) => {
        e.stopPropagation();
        setRutinaEnEdicion(workout);
        setMostrarEditor(true);
    };

    const handleGuardarExito = () => {
        setMostrarEditor(false);
        setRutinaEnEdicion(null);
        fetchHistorial();
    };

    const toggleExpand = (id) => {
        setRutinasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const agruparPorBloque = (exercises) => {
        if (!exercises) return {};
        return exercises.reduce((acc, ex) => {
            const bloque = ex.blockName || 'Sin Bloque';
            if (!acc[bloque]) acc[bloque] = [];
            acc[bloque].push(ex);
            return acc;
        }, {});
    };

    const rutinasFiltradas = workouts.filter(workout => {
        if (!workout.scheduledDate) return false;
        
        const fechaRutinaStr = workout.scheduledDate.split('T')[0];
        
        let cumpleInicio = true;
        let cumpleFin = true;

        if (fechaInicio) cumpleInicio = fechaRutinaStr >= fechaInicio;
        if (fechaFin) cumpleFin = fechaRutinaStr <= fechaFin;

        return cumpleInicio && cumpleFin;
    });

    if (loading) return <p style={{ padding: '20px', color: 'var(--coach-text-muted)' }}>Cargando historial de entrenamientos...</p>;
    
    if (mostrarEditor) {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>✏️ Editando: {rutinaEnEdicion.name}</h3>
                    <button onClick={() => setMostrarEditor(false)} className="coach-btn coach-btn-outline">
                        🔙 Cancelar / Volver
                    </button>
                </div>
                
                <PlanificadorRutina 
                    alumnoId={alumnoId} 
                    isTemplateMode={false} 
                    initialTemplate={rutinaEnEdicion} 
                    onSaveSuccess={handleGuardarExito} 
                />
            </div>
        );
    }

    if (!workouts || workouts.length === 0) {
        return (
            <div className="coach-card-empty">
                <p>Aún no hay rutinas planificadas para este atleta.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--coach-text-dark)' }}>Sesiones Planificadas</h3>
            </div>

            <div className="coach-card" style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label className="coach-label" style={{ fontSize: '13px', marginBottom: '5px' }}>Desde:</label>
                        <input 
                            type="date" 
                            className="coach-input" 
                            value={fechaInicio} 
                            onChange={(e) => setFechaInicio(e.target.value)} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="coach-label" style={{ fontSize: '13px', marginBottom: '5px' }}>Hasta:</label>
                        <input 
                            type="date" 
                            className="coach-input" 
                            value={fechaFin} 
                            onChange={(e) => setFechaFin(e.target.value)} 
                        />
                    </div>
                    {(fechaInicio || fechaFin) && (
                        <button 
                            className="coach-btn coach-btn-outline" 
                            style={{ height: '42px', color: '#64748b', borderColor: '#cbd5e1' }}
                            onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                        >
                            ✕ Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {rutinasFiltradas.length > 0 ? (
                    rutinasFiltradas.map((workout) => {
                        const isExpanded = rutinasExpandidas[workout.id];
                        const ejerciciosAgrupados = agruparPorBloque(workout.exercises);
                        const estadoTexto = workout.estado || 'PENDIENTE';
                        const isCompletado = estadoTexto === 'COMPLETADA' || estadoTexto === 'COMPLETADO';

                        return (
                            <div key={workout.id} className="coach-card" style={{ borderLeft: `6px solid ${isCompletado ? '#22c55e' : 'var(--coach-primary)'}`, padding: '15px 20px', transition: 'all 0.3s ease' }}>
                                
                                <div 
                                    className="coach-card-header" 
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', margin: 0 }}
                                    onClick={() => toggleExpand(workout.id)}
                                >
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--coach-text-dark)' }}>
                                            {workout.name || 'Sin título'}
                                        </h4>
                                        <span style={{ color: 'var(--coach-text-muted)', fontSize: '14px', display: 'inline-block', marginTop: '4px' }}>
                                            📅 {new Date(workout.scheduledDate + 'T12:00:00').toLocaleDateString('es-CL')} 
                                            {workout.executionTimeMinutes && ` • ⏱️ ${workout.executionTimeMinutes} min`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{
                                            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: isCompletado ? '#dcfce7' : '#f1f5f9',
                                            color: isCompletado ? '#166534' : '#475569'
                                        }}>
                                            {isCompletado ? '✅ COMPLETADO' : '⏳ PENDIENTE'}
                                        </span>
                                        
                                        {!isCompletado && (
                                            <button className="coach-btn" style={{ backgroundColor: '#eab308', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={(e) => handleEditarClic(workout, e)}>
                                                ✏️ Editar
                                            </button>
                                        )}
                                        
                                        <span style={{ color: '#94a3b8', fontSize: '14px', width: '20px', textAlign: 'center' }}>
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                                        {Object.entries(ejerciciosAgrupados).map(([nombreBloque, ejercicios]) => (
                                            <div key={nombreBloque} style={{ marginBottom: '25px' }}>
                                                <h5 style={{ 
                                                    fontSize: '15px', color: 'var(--coach-primary)', margin: '0 0 10px 0', 
                                                    paddingBottom: '5px', borderBottom: '2px solid #e2e8f0', display: 'inline-block' 
                                                }}>
                                                    {nombreBloque}
                                                </h5>
                                                
                                                <div className="coach-table-container" style={{ margin: 0, boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                                                    <table className="coach-table" style={{ margin: 0 }}>
                                                        <thead style={{ backgroundColor: '#f8fafc' }}>
                                                            <tr>
                                                                <th style={{ color: '#64748b' }}>Ejercicio</th>
                                                                <th style={{ color: '#64748b' }}>Series x Reps</th>
                                                                <th style={{ color: '#64748b' }}>Intensidad / Carga</th>
                                                                <th style={{ color: '#64748b' }}>Descanso</th>
                                                                <th style={{ color: '#64748b' }}>Notas Coach</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {ejercicios.map((ex, idx) => {
                                                                const hasExecutions = isCompletado && ex.executions && ex.executions.length > 0;
                                                                const sortedExecutions = hasExecutions ? [...ex.executions].sort((a, b) => a.setNumber - b.setNumber) : [];

                                                                return (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                        <td style={{ fontWeight: '500', verticalAlign: 'top', paddingTop: '12px' }}>
                                                                            {ex.exercise?.name}
                                                                            {hasExecutions && sortedExecutions[0].athleteNotes && (
                                                                                <div style={{ fontSize: '12px', color: '#eab308', marginTop: '4px', fontStyle: 'italic' }}>
                                                                                    📝 "{sortedExecutions[0].athleteNotes}"
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        
                                                                        <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                                                                            <div style={{ color: hasExecutions ? '#94a3b8' : 'var(--coach-text-dark)', fontSize: hasExecutions ? '12px' : '14px', textDecoration: hasExecutions ? 'line-through' : 'none', marginBottom: '6px' }}>
                                                                                {ex.sets} x {ex.reps} {ex.targetRpe ? <span style={{ fontSize: '12px' }}> (RPE {ex.targetRpe})</span> : ''}
                                                                            </div>
                                                                            {hasExecutions && (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                                    {sortedExecutions.map(exec => (
                                                                                        <div key={exec.id || exec.setNumber} style={{ color: '#166534', fontSize: '13px', fontWeight: '600' }}>
                                                                                            ✅ Serie {exec.setNumber}: {exec.actualReps} reps
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        
                                                                        <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                                                                            <div style={{ color: hasExecutions ? '#94a3b8' : 'var(--coach-text-dark)', fontSize: hasExecutions ? '12px' : '14px', textDecoration: hasExecutions ? 'line-through' : 'none', marginBottom: '6px' }}>
                                                                                {ex.manualWeightOverride 
                                                                                    ? `${ex.manualWeightOverride} kg` 
                                                                                    : (ex.targetWeight > 0 
                                                                                        ? `${ex.targetWeight} kg` 
                                                                                        : (ex.intensityPercentage ? `${ex.intensityPercentage}%` : '-'))}
                                                                            </div>
                                                                            {hasExecutions && (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                                    {sortedExecutions.map(exec => (
                                                                                        <div key={exec.id || exec.setNumber} style={{ color: '#0f172a', fontSize: '13px', fontWeight: '600' }}>
                                                                                            🎯 {exec.actualWeight} kg
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td style={{ color: '#64748b', verticalAlign: 'top', paddingTop: '12px' }}>{ex.restTime || '-'}</td>
                                                                        <td style={{ fontSize: '13px', color: '#64748b', verticalAlign: 'top', paddingTop: '12px' }}>{ex.notes || '-'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                        No se encontraron rutinas en este rango de fechas.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialRutinas;