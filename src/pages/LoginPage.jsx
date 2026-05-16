import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import logoExcelsior from '../assets/logo.jpeg'; 
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });
            const token = response.data.token;
            
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            
            if (decoded.role === 'ROLE_COACH' || decoded.role === 'COACH') {
                navigate('/dashboard');
            } else if (decoded.role === 'ROLE_ALUMNO' || decoded.role === 'ALUMNO') {
                navigate('/atleta'); // 👈 Corregido para coincidir con tu App.jsx
            } else {
                setError('Rol de usuario no reconocido. Contacta al soporte.');
                localStorage.removeItem('token');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else {
                setError('Error al conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                
                <div className="login-gold-line"></div>
                
                <img src={logoExcelsior} alt="Escudo Excelsior" className="login-logo" />
                
                <h2 className="login-title">WorkoutCeCeApp</h2>
                <p className="login-subtitle">Portal de Acceso</p>

                {error && <div className="login-error-box">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Usuario</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Conectando...' : 'Ingresar ▶'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;