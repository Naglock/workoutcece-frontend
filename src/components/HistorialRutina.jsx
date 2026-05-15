import { useState, useEffect } from 'react';
import api from '../services/api';

const HistorialRutinas = ({ alumnoId }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                // Usamos el endpoint de tu WorkoutController
                // Si tu axios ya tiene el prefijo /api, usa solo '/workouts/...'
                const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                setWorkouts(response.data);
            } catch (err) {
                console.error("Error al cargar el historial:", err);
            } finally {
                setLoading(false);
            }
        };

        if (alumnoId) fetchHistorial();
    }, [alumnoId]);

    if (loading) return <p style={styles.loading}>Cargando historial de entrenamientos...</p>;
    
    if (!workouts || workouts.length === 0) {
        return (
            <div style={styles.emptyCard}>
                <p>Aún no hay rutinas planificadas para este atleta.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.sectionTitle}>Sesiones Planificadas</h3>
            <div style={styles.list}>
                {workouts.map((workout) => (
                    <div key={workout.id} style={styles.workoutCard}>
                        <div style={styles.cardHeader}>
                            <div>
                                <h4 style={styles.workoutName}>{workout.name || 'Sin título'}</h4>
                                <span style={styles.dateBadge}>
                                    {new Date(workout.scheduledDate).toLocaleDateString('es-CL')}
                                </span>
                            </div>
                            <div style={styles.statusBadge}>Asignada</div>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thRow}>
                                        <th style={styles.th}>Bloque</th>
                                        <th style={styles.th}>Ejercicio</th>
                                        <th style={styles.th}>Series x Reps</th>
                                        <th style={styles.th}>Carga Obj.</th>
                                        <th style={styles.th}>Descanso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workout.exercises && workout.exercises.map((ex, idx) => (
                                        <tr key={idx} style={styles.tr}>
                                            <td style={styles.td}><strong>{ex.blockName}</strong></td>
                                            <td style={styles.td}>{ex.exercise?.name}</td>
                                            <td style={styles.td}>{ex.sets} x {ex.reps}</td>
                                            <td style={styles.td}>
                                                {ex.manualWeightOverride 
                                                    ? `${ex.manualWeightOverride}kg (Manual)` 
                                                    : (ex.targetWeight ? `${ex.targetWeight}kg` : '-')}
                                            </td>
                                            <td style={styles.td}>{ex.restTime || '-'}</td>
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

const styles = {
    container: { marginTop: '10px' },
    sectionTitle: { color: '#1e293b', marginBottom: '20px', fontSize: '20px' },
    loading: { padding: '20px', color: '#64748b' },
    emptyCard: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0' },
    list: { display: 'flex', flexDirection: 'column', gap: '20px' },
    workoutCard: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '6px solid #3b82f6' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    workoutName: { margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 'bold' },
    dateBadge: { color: '#64748b', fontSize: '14px' },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    thRow: { borderBottom: '2px solid #f1f5f9' },
    th: { textAlign: 'left', padding: '10px 5px', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '12px 5px', color: '#475569', fontSize: '14px' }
};

export default HistorialRutinas;