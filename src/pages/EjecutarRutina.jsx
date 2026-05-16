import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/AtletaStyles.css';

const EjecutarRutina = () => {
    const navigate = useNavigate();
    const [tiempo, setTiempo] = useState(0);

    // Cronómetro de la sesión
    useEffect(() => {
        const timer = setInterval(() => setTiempo(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div>
            <div className="atleta-workout-header">
                <button onClick={() => navigate(-1)} className="atleta-back-btn">✕</button>
                <div className="atleta-workout-title">
                    <span className="atleta-workout-badge">EN CURSO</span>
                    <h2>Salto y Bloqueo</h2>
                </div>
                <div className="atleta-timer">⏱ {formatTime(tiempo)}</div>
            </div>

            <div className="atleta-exercise-card">
                <p className="atleta-exercise-number">Ejercicio 1 de 6</p>
                <h3 className="atleta-exercise-name">Sentadilla Búlgara con Salto</h3>
                
                <div className="atleta-set-container">
                    <div className="atleta-set-row header">
                        <span>Serie</span>
                        <span>Reps</span>
                        <span>Peso (kg)</span>
                        <span>Listo</span>
                    </div>

                    <div className="atleta-set-row active">
                        <span className="atleta-set-num">1</span>
                        <input type="number" defaultValue="8" className="atleta-workout-input" />
                        <input type="number" placeholder="Ej. 20" className="atleta-workout-input" />
                        <button className="atleta-check-btn">✔</button>
                    </div>

                    <div className="atleta-set-row">
                        <span className="atleta-set-num">2</span>
                        <input type="number" defaultValue="8" className="atleta-workout-input" disabled />
                        <input type="number" placeholder="-" className="atleta-workout-input" disabled />
                        <button className="atleta-check-btn disabled">✔</button>
                    </div>

                    <div className="atleta-set-row">
                        <span className="atleta-set-num">3</span>
                        <input type="number" defaultValue="8" className="atleta-workout-input" disabled />
                        <input type="number" placeholder="-" className="atleta-workout-input" disabled />
                        <button className="atleta-check-btn disabled">✔</button>
                    </div>
                </div>
            </div>

            <div className="atleta-workout-controls">
                <button className="atleta-card-btn">
                    Siguiente Ejercicio ▶
                </button>
            </div>
            
            <div className="atleta-spacer" />
        </div>
    );
};

export default EjecutarRutina;