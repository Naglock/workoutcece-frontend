import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import logo from '../assets/logo.jpeg'; 
import '../components/AtletaStyles.css';
import AtletaProgresoSaltos from '../components/AtletaProgresoSaltos';

const getLocalIso = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AtletaInicio = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const [todasLasRutinas, setTodasLasRutinas] = useState([]);
    const [planesMostrados, setPlanesMostrados] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getLocalIso(new Date()));
    const [loading, setLoading] = useState(true);

    const [cumplimientoSemanal, setCumplimientoSemanal] = useState({ diasAsignados: 0, diasCompletados: 0 });
    const [actividadSemanal, setActividadSemanal] = useState([]);
    const [diasSemana, setDiasSemana] = useState([]);

    const generarSemanaActual = () => {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const distanciaAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() + distanciaAlLunes);

        const dias = [];
        const nombresDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(lunes);
            d.setDate(lunes.getDate() + i);
            dias.push({
                isoDate: getLocalIso(d),
                nombre: nombresDias[i],
                numero: d.getDate()
            });
        }
        return dias;
    };

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId; 

                if (alumnoId) {
                    const response = await api.get(`/workouts/my-routine/${alumnoId}`);
                    
                    if (response.data) {
                        const rutinasMapeadas = response.data.map(r => ({
                            ...r,
                            fechaFormato: r.scheduledDate ? r.scheduledDate.split('T')[0].trim() : ''
                        }));
                        setTodasLasRutinas(rutinasMapeadas);

                        const diasSemanaGenerados = generarSemanaActual();
                        setDiasSemana(diasSemanaGenerados);

                        const lunesIso = diasSemanaGenerados[0].isoDate;
                        const domingoIso = diasSemanaGenerados[6].isoDate;

                        const rutinasSemana = rutinasMapeadas.filter(r => r.fechaFormato >= lunesIso && r.fechaFormato <= domingoIso);
                        
                        setCumplimientoSemanal({
                            diasAsignados: rutinasSemana.length,
                            diasCompletados: rutinasSemana.filter(r => r.estado === 'COMPLETADO' || r.isCompleted).length
                        });

                        const diasMapeo = [
                            { dia: 'L', minutos: 0, entreno: false, iso: diasSemanaGenerados[0].isoDate },
                            { dia: 'M', minutos: 0, entreno: false, iso: diasSemanaGenerados[1].isoDate },
                            { dia: 'X', minutos: 0, entreno: false, iso: diasSemanaGenerados[2].isoDate },
                            { dia: 'J', minutos: 0, entreno: false, iso: diasSemanaGenerados[3].isoDate },
                            { dia: 'V', minutos: 0, entreno: false, iso: diasSemanaGenerados[4].isoDate },
                            { dia: 'S', minutos: 0, entreno: false, iso: diasSemanaGenerados[5].isoDate },
                            { dia: 'D', minutos: 0, entreno: false, iso: diasSemanaGenerados[6].isoDate }
                        ];

                        rutinasSemana.forEach(r => {
                            const diaGrafico = diasMapeo.find(d => d.iso === r.fechaFormato);
                            if (diaGrafico) {
                                diaGrafico.entreno = true;
                                if (r.estado === 'COMPLETADO' || r.isCompleted) {
                                    diaGrafico.minutos += r.executionTimeMinutes || 45; 
                                }
                            }
                        });
                        setActividadSemanal(diasMapeo);
                    }
                }
            } catch (err) {
                console.error("Error al cargar datos del dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (todasLasRutinas.length === 0) return;

        const rutinasDeLaFecha = todasLasRutinas.filter(r => r.fechaFormato === selectedDate);
        const hoyIso = getLocalIso(new Date());

        if (rutinasDeLaFecha.length > 0) {
            setPlanesMostrados(rutinasDeLaFecha);
        } else if (selectedDate === hoyIso) {
            const pendientes = todasLasRutinas.filter(r => r.estado !== 'COMPLETADO' && !r.isCompleted);
            if (pendientes.length > 0) {
                setPlanesMostrados([{ ...pendientes[0], name: `${pendientes[0].name} (Próxima)` }]);
            } else {
                setPlanesMostrados([]);
            }
        } else {
            setPlanesMostrados([]);
        }
    }, [selectedDate, todasLasRutinas]);

    const formattedDate = currentTime.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    const porcentaje = cumplimientoSemanal.diasAsignados > 0 
        ? Math.round((cumplimientoSemanal.diasCompletados / cumplimientoSemanal.diasAsignados) * 100) : 0;
    const maxMinutos = Math.max(...actividadSemanal.map(d => d.minutos), 60);

    return (
        <div className="atleta-home">
            <div className="atleta-header">
                <img src={logo} alt="Escudo Excelsior" className="atleta-logo" />
                <div>
                    <h3 className="atleta-title">EXCELSIOR GS DE</h3>
                    <p className="atleta-subtitle">¡A romperla hoy, atleta!</p>
                </div>
            </div>

            <div className="atleta-date-container">
                <p className="atleta-date-text">{formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}</p>
                <p className="atleta-time-text">{formattedTime} • Santiago, Chile</p>
            </div>

            <div className="atleta-week-selector">
                {diasSemana.map((dia, idx) => {
                    const isActive = dia.isoDate === selectedDate;
                    const hasWorkout = todasLasRutinas.some(r => r.fechaFormato === dia.isoDate);
                    return (
                        <div key={idx} className={`atleta-day-bubble ${isActive ? 'active' : ''}`} onClick={() => setSelectedDate(dia.isoDate)}>
                            <span className="atleta-day-name">{dia.nombre}</span>
                            <span className="atleta-day-number">{dia.numero}</span>
                            <div className={`atleta-day-dot ${hasWorkout ? 'visible' : ''}`}></div>
                        </div>
                    );
                })}
            </div>

            <div className="atleta-section-title">
                {selectedDate === getLocalIso(new Date()) ? "Planes de Hoy" : "Planificación del Día"}
            </div>
            
            {loading ? (
                <div className="atleta-empty-state"><p>Sincronizando cronograma...</p></div>
            ) : planesMostrados.length > 0 ? (
                <div className="atleta-routines-stack">
                    {planesMostrados.map((plan) => {
                        const estadoReal = (plan.estado || plan.status || '').toUpperCase();
                        const isCompletado = estadoReal === 'COMPLETADO' || estadoReal === 'COMPLETADA' || plan.isCompleted;

                        return (
                            <div 
                                key={plan.id} 
                                className="atleta-routine-card" 
                                onClick={() => {
                                    if (isCompletado) {
                                        navigate(`editar-resultados?id=${plan.id}`);
                                    } else {
                                        navigate(`rutina-preview?id=${plan.id}`);
                                    }
                                }} 
                                style={{ cursor: 'pointer', marginBottom: '12px' }}
                            >
                                <div className="atleta-card-decor">G</div>
                                <div className="atleta-card-content">
                                    <div className={`atleta-card-badge ${(plan.estado || 'PENDIENTE').toLowerCase()}`}>{plan.estado || 'PENDIENTE'}</div>
                                    <h3 className="atleta-card-title">{plan.name}</h3>
                                    <p className="atleta-card-desc">{plan.exercises?.length || 0} ejercicios asignados</p>
                                    <div className="atleta-card-divider" />
                                    <button className="atleta-card-btn-outline">
                                        {isCompletado ? '✏️ Editar Resultados' : 'Ver Detalles de Sesión 👀'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="atleta-empty-state"><p>Día libre. No hay entrenamientos agendados para esta fecha.</p></div>
            )}

            <div className="atleta-section-title">Cumplimiento Semanal</div>
            <div className="atleta-stats-card">
                <div className="atleta-progress-info">
                    <div className="atleta-progress-text">
                        <span>Progreso de la semana actual</span>
                        <strong>{cumplimientoSemanal.diasCompletados} de {cumplimientoSemanal.diasAsignados} entrenamientos</strong>
                    </div>
                    <div className="atleta-progress-percentage">{porcentaje}%</div>
                </div>
                <div className="atleta-progress-bar-bg">
                    <div className="atleta-progress-bar-fill" style={{ width: `${porcentaje}%` }}></div>
                </div>
            </div>

            <div className="atleta-section-title">Actividad Semanal (Minutos)</div>
            <div className="atleta-activity-card">
                <div className="atleta-chart-container">
                    {actividadSemanal.map((item, index) => {
                        const alturaBarra = (item.minutos / maxMinutos) * 100;
                        return (
                            <div key={index} className="atleta-chart-column">
                                <div className="atleta-chart-bar-wrapper">
                                    {item.minutos > 0 && <span className="atleta-bar-value">{item.minutos}'</span>}
                                    <div className={`atleta-chart-bar ${item.minutos > 0 ? 'filled' : ''} ${item.entreno && item.minutos === 0 ? 'scheduled' : ''}`} style={{ height: `${Math.max(alturaBarra, item.entreno && item.minutos === 0 ? 6 : 0)}px` }}></div>
                                </div>
                                <span className="atleta-chart-label">{item.dia}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <AtletaProgresoSaltos />

            <div className="atleta-spacer" />
        </div>
    );
};

export default AtletaInicio;