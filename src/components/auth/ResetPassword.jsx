import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            alert("Contraseña restablecida con éxito.");
            navigate('/login');
        } catch (err) {
            setMensaje("El token es inválido o ha expirado.");
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2>Nueva Contraseña</h2>
                <form onSubmit={handleReset} className="login-form">
                    <input 
                        type="password" 
                        placeholder="Nueva contraseña" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="login-input"
                        required 
                    />
                    <button type="submit" className="login-button">Confirmar cambio</button>
                </form>
                {mensaje && <p style={{marginTop: '15px', fontSize: '14px', textAlign: 'center'}}>{mensaje}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;