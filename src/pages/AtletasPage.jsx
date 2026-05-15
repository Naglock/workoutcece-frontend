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
            const enlaceCompleto = `http://localhost:5173/registro?token=${tokenGenerado}`;
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
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Plantilla de Jugadores</h2>
                <button onClick={handleGenerateInvite} style={styles.addBtn}>+ Invitar Atleta</button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {loading ? (
                <p>Cargando datos del equipo...</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHead}>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Correo Electrónico</th>
                                <th style={styles.th}>Perfil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {atletas.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={styles.empty}>
                                        No tienes jugadores asignados para esta temporada.
                                    </td>
                                </tr>
                            ) : (
                                atletas.map((atleta) => (
                                    <tr key={atleta.id} style={styles.tableRow}>
                                        <td style={styles.td}><strong>{atleta.fullName}</strong></td>
                                        <td style={styles.td}>{atleta.email}</td>
                                        <td style={styles.td}>
                                            <button 
                                                style={styles.actionBtn}
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

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{marginTop: 0}}>Enlace de Invitación</h3>
                        <p style={{fontSize: '14px', color: '#64748b'}}>
                            Envía este enlace seguro a tus atletas. Cuando se registren, quedarán vinculados automáticamente a tu cuenta.
                        </p>
                        
                        <div style={styles.linkContainer}>
                            <input 
                                type="text" 
                                readOnly 
                                value={inviteLink} 
                                style={styles.linkInput} 
                            />
                            <button onClick={copyToClipboard} style={styles.copyBtn}>
                                {linkCopied ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>

                        <div style={{textAlign: 'right', marginTop: '20px'}}>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { margin: 0, color: '#1e293b' },
    addBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    tableContainer: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: { padding: '15px', color: '#64748b', fontSize: '14px', fontWeight: 'bold' },
    tableRow: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '15px', color: '#334155' },
    actionBtn: { backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    empty: { padding: '30px', textAlign: 'center', color: '#94a3b8' },
    error: { color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px' },
    
    // ESTILOS DEL MODAL
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    linkContainer: { display: 'flex', gap: '10px', marginTop: '15px' },
    linkInput: { flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', outline: 'none' },
    copyBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    closeBtn: { backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }
};

export default AtletasPage;