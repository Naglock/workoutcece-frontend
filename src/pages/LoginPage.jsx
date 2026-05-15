import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    // 1. Manejo del estado para los inputs y errores
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 2. Hook de React Router para redirigir de página
    const navigate = useNavigate();

    // 3. Función que se ejecuta al presionar "Ingresar"
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
            // Decodificamos el token
            const decoded = jwtDecode(token);
            // Verificamos el rol del usuario (Debe ser coach para acceder al dashboard)
            if ((decoded.role !== 'COACH') && (decoded.role !== 'ROLE_COACH')) {
                setError('Acceso denegado: Solo los entrenadores pueden ingresar. Por favor, utiliza la aplicación móvil si eres un atleta.');
                setIsLoading(false);
                return;
            }
            localStorage.setItem('token', token);

            // Redirigimos al Coach a su Dashboard
            navigate('/dashboard');

        } catch (err) {
            // Si el backend responde con error (ej. 401 Unauthorized)
            if (err.response && err.response.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else {
                setError('Error al conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Renderizado visual del formulario
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>WorkoutCeCeApp</h2>
                <p style={styles.subtitle}>Portal del Entrenador</p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={styles.button} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Conectando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: '5px'
    },
    subtitle: {
        textAlign: 'center',
        color: '#666666',
        marginBottom: '20px',
        fontSize: '14px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '14px',
        color: '#333',
        fontWeight: 'bold'
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px'
    },
    button: {
        padding: '12px',
        backgroundColor: '#0056b3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    errorBox: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center',
        fontSize: '14px'
    }
};

export default LoginPage;