import React from 'react';
import './DescargaApp.css';

const DescargaApp = () => {
    return (
        <div className="descarga-page-wrapper">
            <div className="descarga-card">
                
                <div className="descarga-gold-line"></div>

                <div className="descarga-icon-check">✓</div>
                
                <h2 className="descarga-title">¡Registro Completado!</h2>
                <p className="descarga-subtitle">
                    Tu cuenta de <strong>WorkoutCeCe</strong> ha sido vinculada con tu entrenador. 
                    Ahora, descarga la aplicación móvil para ver tus rutinas y registrar tus RM.
                </p>

                <div className="descarga-btn-container">
                    <button className="descarga-store-btn google" onClick={() => alert('Próximamente en Play Store')}>
                        <span className="descarga-btn-sub">Disponible en</span>
                        <span className="descarga-btn-main">Google Play</span>
                    </button>

                    <button className="descarga-store-btn apple" onClick={() => alert('Próximamente en App Store')}>
                        <span className="descarga-btn-sub">Descargar en</span>
                        <span className="descarga-btn-main">App Store</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DescargaApp;