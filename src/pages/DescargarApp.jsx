import React, { useState, useEffect } from 'react';
import './DescargaApp.css';

const DescargaApp = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar');
                }
                setDeferredPrompt(null);
            });
        } else {
            alert("Para instalar: \nEn Android: toca el menú del navegador y selecciona 'Instalar aplicación'. \nEn iOS: toca el botón 'Compartir' y elige 'Agregar al inicio'.");
        }
    };

    return (
        <div className="descarga-page-wrapper">
            <div className="descarga-card">
                <div className="descarga-gold-line"></div>
                <div className="descarga-icon-check">✓</div>
                
                <h2 className="descarga-title">¡Registro Completado!</h2>
                <p className="descarga-subtitle">
                    Tu cuenta de <strong>WorkoutCeCe</strong> está activa.
                    Instala nuestra App en tu pantalla de inicio para acceder rápidamente a tus rutinas.
                </p>

                <div className="descarga-btn-container">
                    <button className="descarga-store-btn" onClick={handleInstall}>
                        <span className="descarga-btn-sub">Instalar en</span>
                        <span className="descarga-btn-main">Pantalla de Inicio</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DescargaApp;