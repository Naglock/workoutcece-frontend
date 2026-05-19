import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import '../components/AtletaStyles.css';

const AtletaProgresoSaltos = () => {
    const [activeTab, setActiveTab] = useState('SJ');
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    const jumpTypes = [
        { id: 'SJ', name: 'Squat Jump' },
        { id: 'CMJ', name: 'Countermovement Jump' },
        { id: 'ABK', name: 'Abalakov' },
        { id: 'DJ40', name: 'Drop Jump 40cm' }
    ];

    useEffect(() => {
        const cargarProgresoSalto = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const decoded = jwtDecode(token);
                const alumnoId = decoded.userId;

                if (alumnoId) {
                    const response = await api.get(`/analytics/jump-progress/${alumnoId}/${activeTab}`);
                    if (response.data) {
                        setHistorial(response.data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        cargarProgresoSalto();
    }, [activeTab]);

    const width = 500;
    const height = 200;
    const padding = 35;

    const renderChart = () => {
        if (historial.length === 0) {
            return (
                <div className="atleta-chart-insufficient">
                    <p>Aún no hay registros de este tipo de salto en tu perfil.</p>
                </div>
            );
        }

        const heights = historial.map(h => h.height);
        const maxVal = Math.max(...heights) + 10;
        const minVal = Math.max(0, Math.min(...heights) - 10);
        const valRange = maxVal - minVal || 1;

        const points = historial.map((item, idx) => {
            const x = historial.length === 1 
                ? width / 2 
                : padding + (idx / (historial.length - 1)) * (width - padding * 2);
            
            const y = height - padding - ((item.height - minVal) / valRange) * (height - padding * 2);
            return { x, y, raw: item };
        });

        let linePath = '';
        let areaPath = '';

        if (historial.length > 1) {
            linePath = points.reduce((acc, p, idx) => {
                return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
            }, '');
            areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
        } else {
            linePath = `M ${padding} ${points[0].y} L ${width - padding} ${points[0].y}`;
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="atleta-svg-graph">
                {[0, 0.5, 1].map((ratio, i) => {
                    const yGrid = padding + ratio * (height - padding * 2);
                    const valGrid = Math.round(maxVal - ratio * valRange);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={yGrid} x2={width - padding} y2={yGrid} stroke="#e2e8f0" strokeDasharray="4 4" />
                            <text x={padding - 8} y={yGrid + 4} className="atleta-svg-text-y" textAnchor="end">{valGrid}cm</text>
                        </g>
                    );
                })}

                {historial.length > 1 && <path d={areaPath} fill="url(#gradientFill)" />}

                <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeDasharray={historial.length === 1 ? "6 6" : "none"} 
                />

                {points.map((p, idx) => {
                    const fechaObj = new Date(p.raw.recordedAt + 'T00:00:00');
                    const fechaCorta = `${fechaObj.getDate()}/${fechaObj.getMonth() + 1}`;

                    return (
                        <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                            <text x={p.x} y={p.y - 10} className="atleta-svg-text-value" textAnchor="middle">{p.raw.height}</text>
                            <text x={p.x} y={height - 12} className="atleta-svg-text-x" textAnchor="middle">{fechaCorta}</text>
                        </g>
                    );
                })}

                <defs>
                    <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                    </linearGradient>
                </defs>
            </svg>
        );
    };

    return (
        <div className="atleta-progress-panel">
            <div className="atleta-agenda-header">
                <h2 className="atleta-agenda-title">Evolución de Salto</h2>
                <p className="atleta-agenda-subtitle">Historial de marcas y potencia vertical</p>
            </div>

            <div className="atleta-jump-tabs">
                {jumpTypes.map(type => (
                    <button
                        key={type.id}
                        className={`atleta-jump-tab-btn ${activeTab === type.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(type.id)}
                    >
                        {type.id}
                    </button>
                ))}
            </div>

            <div className="atleta-activity-card style-chart-wrapper">
                <span className="atleta-feedback-summary-title">Historial: {jumpTypes.find(t => t.id === activeTab).name}</span>
                {loading ? (
                    <p className="atleta-chart-loading">Consultando registros históricos...</p>
                ) : (
                    renderChart()
                )}
            </div>

            {!loading && historial.length > 0 && (
                <div className="atleta-history-table-card">
                    <div className="atleta-table-header-row">
                        <span>Fecha Registro</span>
                        <span>Altura (cm)</span>
                    </div>
                    <div className="atleta-table-body-list">
                        {[...historial].reverse().map((item, index) => (
                            <div key={index} className="atleta-table-body-item">
                                <span>{new Date(item.recordedAt + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <strong>{item.height} cm</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtletaProgresoSaltos;