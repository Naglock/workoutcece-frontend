import '../components/AtletaStyles.css';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.jpeg'; 

const AtletaInicio = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = currentTime.toLocaleTimeString('es-CL', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '30px',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                paddingBottom: '20px'
            }}>
                <img src={logo} alt="Escudo Excelsior" style={{ width: '60px', height: 'auto' }} />
                <div>
                    <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: '#d4af37' }}>EXCELSIOR GS DE</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '3px 0 0 0', fontWeight: '600' }}>
                        ¡A romperla hoy, atleta!
                    </p>
                </div>
            </div>
            <div style={{ marginBottom: '30px', padding: '0 5px' }}>
                <p style={{ color: '#0f172a', fontSize: '15px', margin: 0, fontWeight: '700' }}>
                    {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                </p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '3px 0 0 0', fontWeight: '500' }}>
                    {formattedTime} • Santiago, Chile
                </p>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '25px',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    fontSize: '140px',
                    color: 'rgba(0, 0, 255, 0.04)',
                    zIndex: 1,
                    fontWeight: '800',
                    transform: 'rotate(-15deg)'
                }}>G</div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '-30px',
                        background: 'linear-gradient(135deg, #ff0000 0%, #ef4444 100%)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '0 0 0 20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        PENDIENTE
                    </div>

                    <p style={{ color: '#0000ff', fontSize: '13px', margin: 0, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Planificación de Hoy
                    </p>
                    <h3 style={{ color: '#0f172a', fontSize: '24px', margin: '8px 0 5px 0', fontWeight: '800' }}>
                        Enfoque Salto y Bloqueo
                    </h3>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>
                        6 ejercicios • Aprox 45 min
                    </p>
                    
                    <div style={{ height: '2px', background: '#d4af37', margin: '20px 0', opacity: 0.3 }} />

                    <button style={{
                        background: 'linear-gradient(135deg, #0000ff 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 25px',
                        borderRadius: '15px',
                        fontWeight: '800',
                        fontSize: '16px',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: '0 6px 15px rgba(0, 0, 255, 0.3)',
                        transition: '0.2s',
                        transform: 'translateY(0)'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                        Iniciar Sesión ▶
                    </button>
                </div>
            </div>
        
            <div style={{ height: '50px' }} />
        </div>
    );
};

export default AtletaInicio;