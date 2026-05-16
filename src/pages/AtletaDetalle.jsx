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
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSaveFicha = async () => {
        try {
            const payload = { ...perfil, fullName: perfil.user?.fullname };
            await api.post(`/profiles/update/${id}`, payload);
            setEditMode(false);
            alert("Ficha técnica actualizada exitosamente.");
            fetchPerfil(); 
        } catch (err) { 
            alert("Error al guardar los cambios."); 
        }
    };

    const handleChange = (field, value) => {
        setPerfil(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <p style={{padding: '20px'}}>Cargando ficha técnica...</p>;

    return (
        <div>
            <div className="coach-page-header">
                <button onClick={() => navigate(-1)} className="coach-back-link">← Volver a Atletas</button>
                <h2>Gestión de Atleta: {perfil.user?.fullname}</h2>
            </div>

            <div className="coach-tabs">
                <button 
                    className={`coach-tab ${activeTab === 'ficha' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('ficha')}
                >
                    📊 Ficha Técnica
                </button>
                <button 
                    className={`coach-tab ${activeTab === 'planificar' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('planificar')}
                >
                    📝 Nueva Rutina
                </button>
                <button 
                    className={`coach-tab ${activeTab === 'historial' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('historial')}
                >
                    🗓️ Historial
                </button>
            </div>

            {activeTab === 'ficha' && (
                <div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
                        <button 
                            onClick={editMode ? handleSaveFicha : () => setEditMode(true)}
                            className={`coach-btn ${editMode ? 'coach-btn-success' : 'coach-btn-primary'}`}
                        >
                            {editMode ? '💾 Guardar Todo' : '📝 Editar Ficha'}
                        </button>
                    </div>

                    <div className="coach-grid-2">
                        <section className="coach-card">
                            <div className="coach-card-header">
                                <h3 style={{margin: 0}}>Datos Básicos y Antropometría</h3>
                            </div>
                            
                            <div className="coach-form-group">
                                <label className="coach-label">Nombre Completo:</label>
                                <input type="text" disabled={!editMode} value={perfil.user?.fullname || ''} 
                                    onChange={e => setPerfil({...perfil, user: {...perfil.user, fullname: e.target.value}})} 
                                    className="coach-input"/>
                            </div>
                            
                            <div className="coach-form-group">
                                <label className="coach-label">Posición:</label>
                                <select disabled={!editMode} value={perfil.position || ''} onChange={e => handleChange('position', e.target.value)} className="coach-input">
                                    <option value="">Seleccionar...</option>
                                    <option value="Central">Central</option>
                                    <option value="Punta">Punta</option>
                                    <option value="Opuesto">Opuesto</option>
                                    <option value="Armador">Armador</option>
                                    <option value="Libero">Libero</option>
                                </select>
                            </div>

                            <div className="coach-form-row">
                                <div>
                                    <label className="coach-label">Peso (kg):</label>
                                    <input type="number" disabled={!editMode} value={perfil.weight || ''} onChange={e => handleChange('weight', e.target.value)} className="coach-input"/>
                                </div>
                                <div>
                                    <label className="coach-label">Altura (cm):</label>
                                    <input type="number" disabled={!editMode} value={perfil.height || ''} onChange={e => handleChange('height', e.target.value)} className="coach-input"/>
                                </div>
                                <div>
                                    <label className="coach-label">Edad:</label>
                                    <input type="number" disabled={!editMode} value={perfil.age || ''} onChange={e => handleChange('age', e.target.value)} className="coach-input"/>
                                </div>
                            </div>
                        </section>

                        <section className="coach-card">
                            <div className="coach-card-header">
                                <h3 style={{margin: 0}}>Pliometría y Salto</h3>
                            </div>
                            <div className="coach-form-row">
                                <div><label className="coach-label">Abalakov (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpAbalakov || ''} onChange={e => handleChange('jumpAbalakov', e.target.value)} className="coach-input"/></div>
                                <div><label className="coach-label">CMJ (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpCmj || ''} onChange={e => handleChange('jumpCmj', e.target.value)} className="coach-input"/></div>
                                <div><label className="coach-label">SJ (cm):</label><input type="number" disabled={!editMode} value={perfil.jumpSj || ''} onChange={e => handleChange('jumpSj', e.target.value)} className="coach-input"/></div>
                            </div>
                            <div className="coach-form-row">
                                <div><label className="coach-label">Drop Jump 40cm:</label><input type="number" disabled={!editMode} value={perfil.jumpDrop40 || ''} onChange={e => handleChange('jumpDrop40', e.target.value)} className="coach-input"/></div>
                                <div><label className="coach-label">RSI (Reactividad):</label><input type="number" disabled={!editMode} value={perfil.rsiDrop40 || ''} onChange={e => handleChange('rsiDrop40', e.target.value)} className="coach-input"/></div>
                            </div>
                        </section>

                        <section className="coach-card">
                            <div className="coach-card-header">
                                <h3 style={{margin: 0}}>Fuerza Máxima</h3>
                            </div>
                            <div className="coach-form-row">
                                <div><label className="coach-label">Sentadilla (kg):</label><input type="number" disabled={!editMode} value={perfil.rmSquat || ''} onChange={e => handleChange('rmSquat', e.target.value)} className="coach-input"/></div>
                                <div><label className="coach-label">P. Banca (kg):</label><input type="number" disabled={!editMode} value={perfil.rmBenchPress || ''} onChange={e => handleChange('rmBenchPress', e.target.value)} className="coach-input"/></div>
                            </div>
                            <div className="coach-form-row">
                                <div><label className="coach-label">P. Muerto (kg):</label><input type="number" disabled={!editMode} value={perfil.rmDeadlift || ''} onChange={e => handleChange('rmDeadlift', e.target.value)} className="coach-input"/></div>
                                <div><label className="coach-label">Dominadas (Máx):</label><input type="number" disabled={!editMode} value={perfil.pullUps || ''} onChange={e => handleChange('pullUps', e.target.value)} className="coach-input"/></div>
                            </div>
                        </section>

                        <section className="coach-card">
                            <div className="coach-card-header">
                                <h3 style={{margin: 0}}>Movilidad y Salud</h3>
                            </div>
                            <label className="coach-label">Score Movilidad (1-10):</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                                <input type="range" min="1" max="10" disabled={!editMode} value={perfil.mobilityScore || 5} onChange={e => handleChange('mobilityScore', e.target.value)} style={{flex: 1, cursor: editMode? 'pointer' : 'default'}}/>
                                <span className="coach-badge">
                                    {perfil.mobilityScore || 5}
                                </span>
                            </div>
                            
                            <div className="coach-form-group">
                                <label className="coach-label">Estado OHS (Sentadilla OverHead):</label>
                                <select disabled={!editMode} value={perfil.ohsStatus || ''} onChange={e => handleChange('ohsStatus', e.target.value)} className="coach-input">
                                    <option value="Correcto">Correcto</option>
                                    <option value="Compensación">Compensación</option>
                                    <option value="Inestable">Inestable</option>
                                </select>
                            </div>

                            <div className="coach-form-group">
                                <label className="coach-label">Notas Médicas / Lesiones:</label>
                                <textarea disabled={!editMode} value={perfil.medicalNotes || ''} onChange={e => handleChange('medicalNotes', e.target.value)} className="coach-textarea"/>
                            </div>
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

export default AtletaDetalle;