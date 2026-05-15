import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Procesando registro...');
        setIsError(false);

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
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={{marginTop: 0, color: '#1e293b'}}>Registro de Atleta</h2>
                <p style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>
                    Crea tu cuenta para unirte al equipo.
                </p>
                
                <input 
                    type="text" 
                    placeholder="Nombre de Usuario" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    required 
                    style={styles.input}
                />

                <input 
                    type="text" 
                    placeholder="Nombre Completo"
                    required
                    style={styles.input}
                    value={formData.fullname}
                    onChange={e => setFormData({...formData, fullname: e.target.value})}
                />

                <input 
                    type="email" 
                    placeholder="Correo Electrónico" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                    style={styles.input}
                />
                
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                    style={styles.input}
                />
                
                <button type="submit" style={styles.btn}>Unirse al Equipo</button>
                
                {status && (
                    <p style={{...styles.statusText, color: isError ? '#ef4444' : '#10b981'}}>
                        {status}
                    </p>
                )}
            </form>
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'system-ui, sans-serif' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '380px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    statusText: { marginTop: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }
};

export default RegistroPage;