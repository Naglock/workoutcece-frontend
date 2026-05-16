import { useState, useEffect } from 'react';
import api from '../services/api';
import PlanificadorRutina from './PlanificadorRutina';

const HistorialRutinas = ({ alumnoId }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rutinaEnEdicion, setRutinaEnEdicion] = useState(null);
    const [mostrarEditor, setMostrarEditor] = useState(false);

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/workouts/my-routine/${alumnoId}`);
            setWorkouts(response.data);
        } catch (err) {
            console.error("Error al cargar el historial:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (alumnoId) fetchHistorial();
    }, [alumnoId]);

    const handleEditarClic = (workout) => {
        setRutinaEnEdicion(workout);
        setMostrarEditor(true);
    };

    const handleGuardarExito = () => {
        setMostrarEditor(false);
        setRutinaEnEdicion(null);
        fetchHistorial();
    };

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
            <h3 style={{ marginBottom: '20px', color: 'var(--coach-text-dark)' }}>Sesiones Planificadas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {workouts.map((workout) => (
                    <div key={workout.id} className="coach-card" style={{ borderLeft: '6px solid var(--coach-primary)' }}>
                        <div className="coach-card-header">
                            <div>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{workout.name || 'Sin título'}</h4>
                                <span style={{ color: 'var(--coach-text-muted)', fontSize: '14px', display: 'inline-block', marginTop: '4px' }}>
                                    {new Date(workout.scheduledDate).toLocaleDateString('es-CL')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span className="coach-status-badge success">Asignada</span>
                                <button className="coach-btn" style={{ backgroundColor: '#eab308', color: 'white' }} onClick={() => handleEditarClic(workout)}>
                                    ✏️ Editar
                                </button>
                            </div>
                        </div>
                        
                        <div className="coach-table-container">
                            <table className="coach-table">
                                <thead>
                                    <tr>
                                        <th>Bloque</th>
                                        <th>Ejercicio</th>
                                        <th>Series x Reps</th>
                                        <th>Carga Obj.</th>
                                        <th>Descanso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workout.exercises && workout.exercises.map((ex, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{ex.blockName}</strong></td>
                                            <td>{ex.exercise?.name}</td>
                                            <td>{ex.sets} x {ex.reps}</td>
                                            <td>
                                                {ex.manualWeightOverride 
                                                    ? `${ex.manualWeightOverride}kg (Manual)` 
                                                    : (ex.targetWeight ? `${ex.targetWeight}kg` : '-')}
                                            </td>
                                            <td>{ex.restTime || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistorialRutinas;