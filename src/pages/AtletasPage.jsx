import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AtletasPage = () => {
    const navigate = useNavigate();
    const [atletas, setAtletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        const fetchAtletas = async () => {
            try {
                const response = await api.get('/coach/athletes');
                setAtletas(response.data);
            } catch (err) {
                console.error("Error al cargar los atletas:", err);
                setError('Hubo un problema al cargar tu lista de jugadores.');
            } finally {
                setLoading(false);
            }
        };

        fetchAtletas();
    }, []);

    const handleGenerateInvite = async () => {
        setIsModalOpen(true);
        setInviteLink('Generando enlace...');
        setLinkCopied(false);
        try {
            const response = await api.post('/invitations/generate-alumno');
            const tokenGenerado = response.data.code;            
            const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
            const enlaceCompleto = `${baseUrl}/registro?token=${tokenGenerado}`;
            setInviteLink(enlaceCompleto);
        } catch (error) {
            console.error("Error generando la invitación:", error);
            setInviteLink('Error al generar el enlace. Verifica tus permisos.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000); 
    };

    return (
        <div>
            <div className="coach-card">
                <div className="coach-card-header">
                    <h2>Plantilla de Jugadores</h2>
                    <button onClick={handleGenerateInvite} className="coach-btn coach-btn-primary">
                        + Invitar Atleta
                    </button>
                </div>

                {error && <p style={{ color: 'var(--coach-danger)', marginBottom: '15px' }}>{error}</p>}

                {loading ? (
                    <p>Cargando datos del equipo...</p>
                ) : (
                    <div className="coach-table-container">
                        <table className="coach-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo Electrónico</th>
                                    <th>Perfil</th>
                                </tr>
                            </thead>
                            <tbody>
                                {atletas.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--coach-text-muted)' }}>
                                            No tienes jugadores asignados para esta temporada.
                                        </td>
                                    </tr>
                                ) : (
                                    atletas.map((atleta) => (
                                        <tr key={atleta.id}>
                                            <td><strong>{atleta.fullName}</strong></td>
                                            <td>{atleta.email}</td>
                                            <td>
                                                <button 
                                                    className="coach-btn coach-btn-outline"
                                                    onClick={() => navigate(`/dashboard/atletas/${atleta.id}`)}
                                                >
                                                    Ver Perfil
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="coach-modal-overlay">
                    <div className="coach-modal-content">
                        <h3>Enlace de Invitación</h3>
                        <p style={{ fontSize: '14px', color: 'var(--coach-text-muted)', marginBottom: '15px' }}>
                            Envía este enlace seguro a tus atletas. Cuando se registren, quedarán vinculados automáticamente a tu cuenta.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                readOnly 
                                value={inviteLink} 
                                className="coach-input"
                            />
                            <button 
                                onClick={copyToClipboard} 
                                className="coach-btn coach-btn-primary"
                                style={{ backgroundColor: linkCopied ? '#10b981' : 'var(--coach-primary)' }}
                            >
                                {linkCopied ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button onClick={() => setIsModalOpen(false)} className="coach-btn coach-btn-outline">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtletasPage;