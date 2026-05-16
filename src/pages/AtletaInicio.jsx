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
            <div className="atleta-header">
                <img src={logo} alt="Escudo Excelsior" className="atleta-logo" />
                <div>
                    <h3 className="atleta-title">EXCELSIOR GS DE</h3>
                    <p className="atleta-subtitle">
                        ¡A romperla hoy, atleta!
                    </p>
                </div>
            </div>
            
            <div className="atleta-date-container">
                <p className="atleta-date-text">
                    {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                </p>
                <p className="atleta-time-text">
                    {formattedTime} • Santiago, Chile
                </p>
            </div>

            <div className="atleta-routine-card">
                <div className="atleta-card-decor">G</div>
                
                <div className="atleta-card-content">
                    <div className="atleta-card-badge">
                        PENDIENTE
                    </div>

                    <p className="atleta-card-subtitle">
                        Planificación de Hoy
                    </p>
                    <h3 className="atleta-card-title">
                        Enfoque Salto y Bloqueo
                    </h3>
                    <p className="atleta-card-desc">
                        6 ejercicios • Aprox 45 min
                    </p>
                    
                    <div className="atleta-card-divider" />

                    <button className="atleta-card-btn">
                        Iniciar Sesión ▶
                    </button>
                </div>
            </div>
        
            <div className="atleta-spacer" />
        </div>
    );
};

export default AtletaInicio;