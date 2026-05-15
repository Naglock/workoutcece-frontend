import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import HistorialRutinas from '../components/HistorialRutina';
import PlanificadorRutina from '../components/PlanificadorRutina'; 

const AtletaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('ficha');

    useEffect(() => { fetchPerfil(); }, [id]);

    const fetchPerfil = async () => {
        try {
            const response = await api.get(`/coach/athletes-profile/${id}`);
            setPerfil(response.data);
        } catch (err) { console.error("Error cargando perfil:", err); }
        finally { setLoading(false); }
    };

    const handleSaveFicha = async () => {
        try {
            const payload = { ...perfil, fullName: perfil.user?.fullname };
            await api.post(`/profiles/update/${id}`, payload);
            setEditMode(false);
            alert("Ficha técnica actualizada exitosamente.");
            fetchPerfil(); 
        } catch (err) { alert("Error al guardar los cambios."); }
    };

    const handleChange = (field, value) => {
        setPerfil(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <p style={{padding: '20px'}}>Cargando ficha técnica...</p>;

    return (
        <div style={styles.container}>
            {/* CABECERA Y PESTAÑAS */}
            <div style={styles.headerContainer}>
                <div style={styles.headerTop}>
                    <div>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Volver</button>
                        <h2 style={styles.title}>Gestión de Atleta: {perfil.user?.fullname}</h2>
                    </div>
                </div>

                <div style={styles.tabContainer}>
                    <button 
                        style={activeTab === 'ficha' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('ficha')}
                    >
                        📊 Ficha Técnica
                    </button>
                    <button 
                        style={activeTab === 'planificar' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('planificar')}
                    >
                        📝 Nueva Rutina
                    </button>
                    <button 
                        style={activeTab === 'historial' ? styles.activeTab : styles.tab} 
                        onClick={() => setActiveTab('historial')}
                    >
                        🗓️ Historial
                    </button>
                </div>
            </div>

            {activeTab === 'ficha' && (
                <div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                        <button 
                            onClick={editMode ? handleSaveFicha : () => setEditMode(true)}
                            style={editMode ? styles.saveBtn : styles.editBtn}
                        >
                            {editMode ? '💾 Guardar Todo' : '📝 Editar Ficha'}
                        </button>
                    </div>

                    <div style={styles.grid}>
                        {/* 1. DATOS PERSONALES Y ANTROPOMETRÍA */}
                        <section style={styles.card}>
                            <h3 style={styles.cardTitle}>Datos Básicos y Antropometría</h3>
                            <div style={styles.inputGroup}>
                                <label>Nombre Completo:</label>
                                <input type="text" disabled={!editMode} value={perfil.user?.fullname || ''} 
                                    onChange={e => setPerfil({...perfil, user: {...perfil.user, fullname: e.target.value}})} style={styles.input}/>
                                
                                <label>Posición:</label>
                                <select disabled={!editMode} value={perfil.position || ''} onChange={e => handleChange('position', e.target.value)} style={styles.input}>
                                    <option value="">Seleccionar...</option>
                                    <option value="Central">Central</option>
                                    <option value="Punta">Punta</option>
                                    <option value="Opuesto">Opuesto</option>
                                    <option value="Armador">Armador</option>
                                    <option value="Libero">Libero</option>
                                </select>

                                <div style={styles.row}>
                                    <div><label>Peso (kg):</label><input type="number" disabled={!editMode} value={perfil.weight || ''} onChange={e => handleChange('weight', e.target.value)} style={styles.input}/></div>
                                    <div><label>Altura (cm):</label><input type="number" disabled={!editMode} value={perfil.height || ''} onChange={e => handleChange('height', e.target.value)} style={styles.input}/></div>
                                    <div><label>Edad:</label><input type="number" disabled={!editMode} value={perfil.age || ''} onChange={e => handleChange('age', e.target.value)} style={styles.input}/></div>
                                </div>
                            </div>
                        </section>

                        {/* 2. PLIOMETRÍA (SALTOS) */}
                        <section style={styles.card}>
                            <h3 style={styles.cardTitle}>Pliometría y Salto</h3>
                            <div style={styles.row}>
                                <div><label>Abalakov (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpAbalakov || ''} onChange={e => handleChange('jumpAbalakov', e.target.value)} style={styles.input}/></div>
                                <div><label>CMJ (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpCmj || ''} onChange={e => handleChange('jumpCmj', e.target.value)} style={styles.input}/></div>
                                <div><label>SJ (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpSj || ''} onChange={e => handleChange('jumpSj', e.target.value)} style={styles.input}/></div>
                            </div>
                            <div style={styles.row}>
                                <div><label>Drop Jump 40cm:</label><input type="number" disabled={!editMode} value={perfil.jumpDrop40 || ''} onChange={e => handleChange('jumpDrop40', e.target.value)} style={styles.input}/></div>
                                <div><label>RSI (Reactividad):</label><input type="number" disabled={!editMode} value={perfil.rsiDrop40 || ''} onChange={e => handleChange('rsiDrop40', e.target.value)} style={styles.input}/></div>
                            </div>
                        </section>

                        {/* 3. FUERZA (1RM) */}
                        <section style={styles.card}>
                            <h3 style={styles.cardTitle}>Fuerza Máxima</h3>
                            <div style={styles.row}>
                                <div><label>Sentadilla (kg):</label><input type="number" disabled={!editMode} value={perfil.rmSquat || ''} onChange={e => handleChange('rmSquat', e.target.value)} style={styles.input}/></div>
                                <div><label>P. Banca (kg):</label><input type="number" disabled={!editMode} value={perfil.rmBenchPress || ''} onChange={e => handleChange('rmBenchPress', e.target.value)} style={styles.input}/></div>
                            </div>
                            <div style={styles.row}>
                                <div><label>P. Muerto (kg):</label><input type="number" disabled={!editMode} value={perfil.rmDeadlift || ''} onChange={e => handleChange('rmDeadlift', e.target.value)} style={styles.input}/></div>
                                <div><label>Dominadas (Máx):</label><input type="number" disabled={!editMode} value={perfil.pullUps || ''} onChange={e => handleChange('pullUps', e.target.value)} style={styles.input}/></div>
                            </div>
                        </section>

                        {/* 4. MOVILIDAD Y NOTAS MÉDICAS */}
                        <section style={styles.card}>
                            <h3 style={styles.cardTitle}>Movilidad y Salud</h3>
                            <label>Score Movilidad (1-10):</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
                                <input type="range" min="1" max="10" disabled={!editMode} value={perfil.mobilityScore || 5} onChange={e => handleChange('mobilityScore', e.target.value)} style={{flex: 1, cursor: editMode? 'pointer' : 'default'}}/>
                                <span style={styles.scoreBadge}>
                                    {perfil.mobilityScore || 5}
                                </span>
                            </div>
                            <label>Estado OHS (Sentadilla OverHead):</label>
                            <select disabled={!editMode} value={perfil.ohsStatus || ''} onChange={e => handleChange('ohsStatus', e.target.value)} style={styles.input}>
                                <option value="Correcto">Correcto</option>
                                <option value="Compensación">Compensación</option>
                                <option value="Inestable">Inestable</option>
                            </select>

                            <label>Notas Médicas / Lesiones:</label>
                            <textarea disabled={!editMode} value={perfil.medicalNotes || ''} onChange={e => handleChange('medicalNotes', e.target.value)} style={styles.textarea}/>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'planificar' && (
                <PlanificadorRutina alumnoId={id} />
            )}

            {activeTab === 'historial' && (
                <HistorialRutinas alumnoId={id} />
            )}
        </div>
    );
};


const styles = {
    container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    headerContainer: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { margin: '10px 0 0 0', color: '#1e293b' },
    backBtn: { border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', padding: 0 },
    
    tabContainer: { display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' },
    tab: { padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px', fontWeight: '600', borderRadius: '8px' },
    activeTab: { padding: '10px 20px', backgroundColor: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: '600', borderRadius: '8px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    cardTitle: { marginTop: 0, marginBottom: '20px', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' },
    row: { display: 'flex', gap: '15px', marginBottom: '10px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', height: '80px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none' },
    editBtn: { padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    saveBtn: { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    scoreBadge: { backgroundColor: '#3b82f6', color: 'white', padding: '5px 10px', borderRadius: '10px', fontWeight: 'bold' }
};

export default AtletaDetalle;