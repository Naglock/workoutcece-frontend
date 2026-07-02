import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/auth/forgot-password?email=${email}`);
            setMensaje("Enviado con éxito. Redirigiendo...");
            setTimeout(() => {
                navigate('/');
            }, 2000);
            
        } catch (err) {
            setMensaje("Error: No se pudo procesar la solicitud.");
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2>Recuperar Contraseña</h2>
                <form onSubmit={handleRequest} className="login-form">
                    <input 
                        type="email" 
                        placeholder="Tu correo electrónico" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="login-input"
                        required 
                    />
                    <button type="submit" className="login-button">Enviar instrucciones</button>
                </form>
                {mensaje && <p style={{marginTop: '15px', fontSize: '14px', textAlign: 'center'}}>{mensaje}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;