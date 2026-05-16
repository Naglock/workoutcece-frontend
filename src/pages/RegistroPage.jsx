import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoExcelsior from '../assets/logo.jpeg'; 
import './RegistroPage.css';

const RegistroPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token'); 

    const [formData, setFormData] = useState({ 
        username: '',
        fullname: '',
        email: '', 
        password: '' 
    });
    const [status, setStatus] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Procesando registro...');
        setIsError(false);
        setIsLoading(true);

        try {
            const payload = {
                username: formData.username,
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password,
                inviteCode: token 
            };

            await api.post('/auth/register', payload);
            
            setStatus('¡Cuenta creada con éxito! Redirigiendo...');
            setTimeout(() => navigate('/descargar-app'), 3000);
        } catch (err) {
            setIsError(true);
            setStatus(err.response?.data || 'Error al registrar. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <div className="registro-page-wrapper">
            <div className="registro-card">
                
                <div className="registro-gold-line"></div>
                
                <img src={logoExcelsior} alt="Escudo Excelsior" className="registro-logo" />

                <h2 className="registro-title">Registro de Atleta</h2>
                <p className="registro-subtitle">
                    Crea tu cuenta para unirte al equipo
                </p>

                {status && (
                    <div className={`registro-status-box ${isError ? 'error' : 'success'}`}>
                        {status}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="registro-form">
                    
                    <div className="registro-input-group">
                        <label className="registro-label">Usuario</label>
                        <input 
                            type="text" 
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                            required 
                            className="registro-input"
                        />
                    </div>

                    <div className="registro-input-group">
                        <label className="registro-label">Nombre Completo</label>
                        <input 
                            type="text" 
                            required
                            className="registro-input"
                            value={formData.fullname}
                            onChange={e => setFormData({...formData, fullname: e.target.value})}
                        />
                    </div>

                    <div className="registro-input-group">
                        <label className="registro-label">Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required 
                            className="registro-input"
                        />
                    </div>
                    
                    <div className="registro-input-group">
                        <label className="registro-label">Contraseña</label>
                        <input 
                            type="password" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            required 
                            className="registro-input"
                        />
                    </div>
                    
                    <button type="submit" className="registro-button" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : 'Unirse al Equipo ▶'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

export default RegistroPage;