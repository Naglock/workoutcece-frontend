import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const AtletaHistorial = () => {
    const navigate = useNavigate();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId || decoded.id;

                if (alumnoId) {
                    const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                    setRoutines(response.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, []);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; 
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const routinesByDate = {};
    routines.forEach(routine => {
        if (routine.scheduledDate) {
            const dateStr = routine.scheduledDate.split('T')[0];
            if (!routinesByDate[dateStr]) routinesByDate[dateStr] = [];
            routinesByDate[dateStr].push(routine);
        }
    });

    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="atleta-cal-cell empty"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;
            
            const dayRoutines = routinesByDate[dateStr] || [];
            
            const hasPending = dayRoutines.some(r => {
                const estado = (r.estado || r.status || '').toUpperCase();
                return estado !== 'COMPLETADO' && !r.isCompleted;
            });
            const hasCompleted = dayRoutines.some(r => {
                const estado = (r.estado || r.status || '').toUpperCase();
                return estado === 'COMPLETADO' || r.isCompleted;
            });

            days.push(
                <div 
                    key={d} 
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`atleta-cal-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    style={{
                        padding: '10px 5px', textAlign: 'center', cursor: 'pointer',
                        borderRadius: '8px', border: isSelected ? '2px solid #0f172a' : '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f8fafc' : 'white',
                        fontWeight: isToday ? 'bold' : 'normal',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                    }}
                >
                    <span>{d}</span>
                    <div style={{ display: 'flex', gap: '2px', height: '6px' }}>
                        {hasCompleted && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }} />}
                        {hasPending && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0f172a' }} />}
                    </div>
                </div>
            );
        }
        return days;
    };

    if (loading) return <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>Cargando agenda de entrenamiento...</p>;

    const selectedRoutines = routinesByDate[selectedDateStr] || [];
    const mesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="atleta-agenda-container">
            <div className="atleta-agenda-header">
                <h2 className="atleta-agenda-title">Mi Planificación</h2>
                <p className="atleta-agenda-subtitle">Selecciona un día para ver tus entrenamientos</p>
            </div>

            <div className="coach-card" style={{ padding: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <button onClick={prevMonth} className="coach-btn coach-btn-outline" style={{ padding: '5px 10px', borderColor: '#e2e8f0', color: '#0f172a' }}>◀</button>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>
                        {mesNombres[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button onClick={nextMonth} className="coach-btn coach-btn-outline" style={{ padding: '5px 10px', borderColor: '#e2e8f0', color: '#0f172a' }}>▶</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{d}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {renderCalendarGrid()}
                </div>
            </div>

            <div className="atleta-agenda-list">
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '16px' }}>
                    Entrenamientos para el {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>

                {selectedRoutines.length === 0 ? (
                    <div className="atleta-empty-state" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b' }}>Día de descanso. No hay rutinas programadas. 🛌</p>
                    </div>
                ) : (
                    selectedRoutines.map((routine) => {
                        const estadoReal = (routine.estado || routine.status || '').toUpperCase();
                        const isCompletado = estadoReal === 'COMPLETADO' || routine.isCompleted;

                        return (
                            <div key={routine.id} style={{ 
                                backgroundColor: 'white', 
                                borderLeft: `6px solid ${isCompletado ? '#dc2626' : '#0f172a'}`,
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '15px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Bloques de Trabajo
                                    </span>
                                    <span style={{ 
                                        backgroundColor: isCompletado ? '#dc2626' : '#0f172a', 
                                        color: 'white', 
                                        padding: '4px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: '800',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {isCompletado ? 'COMPLETADA' : 'PENDIENTE'}
                                    </span>
                                </div>
                                
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                                        {routine.name}
                                    </h4>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                                        {routine.exercises?.length || 0} ejercicios asignados
                                    </p>
                                    
                                    {!isCompletado ? (
                                        <button 
                                            onClick={() => navigate(`/atleta/rutina-activa?id=${routine.id}`)}
                                            style={{
                                                width: '100%', padding: '12px', borderRadius: '8px',
                                                backgroundColor: '#dc2626', color: 'white', border: 'none',
                                                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                            }}
                                        >
                                            ⚡ Iniciar Entrenamiento
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ 
                                                color: '#0f172a', backgroundColor: '#f8fafc', 
                                                borderLeft: '4px solid #facc15', padding: '10px 12px', 
                                                borderRadius: '0 6px 6px 0', fontSize: '13px', fontWeight: '600' 
                                            }}>
                                                ✓ Sesión completada y marcas registradas
                                            </div>
                                            
                                            <button 
                                                onClick={() => navigate(`/atleta/editar-resultados?id=${routine.id}`)}
                                                style={{ 
                                                    width: '100%', padding: '10px', borderRadius: '8px', 
                                                    backgroundColor: '#facc15', color: '#0f172a', 
                                                    border: 'none', fontWeight: 'bold', 
                                                    cursor: 'pointer', fontSize: '14px',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                                }}
                                            >
                                                ✏️ Corregir valores ingresados
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="atleta-spacer" />
        </div>
    );
};

export default AtletaHistorial;