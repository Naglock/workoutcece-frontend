import React from 'react';

const DescargaApp = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconCheck}>✓</div>
                <h2 style={styles.title}>¡Registro Completado!</h2>
                <p style={styles.subtitle}>
                    Tu cuenta de <strong>WorkoutCeCe</strong> ha sido vinculada con tu entrenador. 
                    Ahora, descarga la aplicación móvil para ver tus rutinas y registrar tus RM.
                </p>

                <div style={styles.buttonContainer}>
                    {/* Botón simulado para Google Play */}
                    <button style={styles.storeBtn} onClick={() => alert('Próximamente en Play Store')}>
                        <span style={styles.btnSub}>Disponible en</span>
                        <span style={styles.btnMain}>Google Play</span>
                    </button>

                    {/* Botón simulado para App Store */}
                    <button style={{...styles.storeBtn, backgroundColor: '#000'}} onClick={() => alert('Próximamente en App Store')}>
                        <span style={styles.btnSub}>Descargar en</span>
                        <span style={styles.btnMain}>App Store</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '20px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', textAlign: 'center' },
    iconCheck: { width: '60px', height: '60px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', margin: '0 auto 20px' },
    title: { color: '#1e293b', marginBottom: '10px', fontSize: '24px' },
    subtitle: { color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' },
    buttonContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
    storeBtn: { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    btnSub: { fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' },
    btnMain: { fontSize: '18px', fontWeight: 'bold' },
    footer: { marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' },
    link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }
};

export default DescargaApp;