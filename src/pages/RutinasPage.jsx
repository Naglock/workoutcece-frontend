import { useState, useEffect } from 'react';
import api from '../services/api';
import PlanificadorRutina from '../components/PlanificadorRutina';

const RutinasPage = () => {
    const [templates, setTemplates] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showBuilder, setShowBuilder] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateToEdit, setTemplateToEdit] = useState(null); 
    
    const [assignData, setAssignData] = useState({ alumnoId: '', scheduledDate: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const tempRes = await api.get('/workouts/templates');
            setTemplates(tempRes.data);

            const athRes = await api.get('/coach/athletes'); 
            setAthletes(Array.isArray(athRes.data) ? athRes.data : []);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (template) => {
        setSelectedTemplate(template);
        setAssignData({ alumnoId: '', scheduledDate: '' });
        setShowAssignModal(true);
    };

    const handleAssignTemplate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/workouts/assign-template/${selectedTemplate.id}/to/${assignData.alumnoId}?scheduledDate=${assignData.scheduledDate}`);
            alert("¡Plantilla asignada exitosamente al jugador!");
            setShowAssignModal(false);
        } catch (err) {
            console.error("Error al asignar:", err.response?.data);
            alert("Error al asignar la plantilla. Revisa la consola.");
        }
    };

    const handleEditTemplate = (template) => {
        setTemplateToEdit(template);
        setShowBuilder(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleSaveSuccess = () => {
        setShowBuilder(false);
        setTemplateToEdit(null);
        fetchData(); 
    };
    
    const handleDeleteTemplate = async (templateId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta plantilla base? Esta acción no se puede deshacer.");
        
        if (confirmDelete) {
            try {
                await api.delete(`/workouts/templates/${templateId}`); 
                setTemplates(templates.filter(t => t.id !== templateId));
                alert("Plantilla eliminada exitosamente.");
            } catch (err) {
                console.error("Error al eliminar:", err.response?.data);
                alert("Error al eliminar la plantilla.");
            }
        }
    };

    if (loading) return <p style={{padding: '20px', textAlign: 'center', color: 'var(--coach-text-muted)'}}>Cargando biblioteca de rutinas...</p>;

    return (
        <div>
            <div className="coach-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Biblioteca de Rutinas</h2>
                    <p style={{ color: 'var(--coach-text-muted)', margin: '5px 0 0 0' }}>Crea plantillas base y asígnalas rápidamente a tu alumno.</p>
                </div>
                <button 
                    onClick={() => {
                        setShowBuilder(!showBuilder);
                        if (showBuilder) setTemplateToEdit(null);
                    }} 
                    className={`coach-btn ${showBuilder ? 'coach-btn-danger' : 'coach-btn-primary'}`}
                >
                    {showBuilder ? '✕ Cerrar Creador' : '+ Nueva Plantilla Base'}
                </button>
            </div>

            {showBuilder && (
                <div style={{ borderTop: '2px dashed var(--coach-border)', paddingTop: '24px', marginBottom: '40px' }}>
                    <h3 style={{ color: 'var(--coach-text-dark)', marginBottom: '20px', fontSize: '20px' }}>
                        {templateToEdit ? 'Editando Plantilla' : 'Diseñar Nueva Plantilla'}
                    </h3>
                    <PlanificadorRutina 
                        isTemplateMode={true} 
                        alumnoId={null} 
                        initialTemplate={templateToEdit}
                        onSaveSuccess={handleSaveSuccess}
                    />
                </div>
            )}

            {!showBuilder && (
                <div className="coach-grid-2">
                    {templates.length === 0 ? (
                        <p style={{ color: 'var(--coach-text-muted)', gridColumn: '1 / -1' }}>
                            No tienes plantillas creadas. Diseña una base de entrenamiento para empezar.
                        </p>
                    ) : (
                        templates.map(template => (
                            <div key={template.id} className="coach-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="coach-card-header">
                                    <h3 style={{ margin: 0 }}>{template.name}</h3>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="coach-region-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                            {template.exercises?.length || 0} Ejercicios
                                        </span>
                                        
                                        <button 
                                            onClick={() => handleEditTemplate(template)}
                                            className="coach-icon-btn"
                                            title="Editar Plantilla"
                                        >
                                            ✏️
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="coach-icon-btn"
                                            title="Eliminar Plantilla"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <p style={{ color: 'var(--coach-text-muted)', margin: '0 0 24px 0', fontSize: '14px' }}>
                                    Bloques de trabajo: <strong style={{ color: 'var(--coach-text-dark)' }}>{new Set(template.exercises?.map(e => e.blockName)).size}</strong>
                                </p>
                                
                                <div style={{ marginTop: 'auto' }}>
                                    <button onClick={() => openAssignModal(template)} className="coach-btn coach-btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                                        🎯 Asignar a Jugador
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showAssignModal && (
                <div className="coach-modal-overlay">
                    <div className="coach-modal-content">
                        <h3>Asignar Rutina</h3>
                        <p style={{ color: 'var(--coach-text-muted)', marginBottom: '24px' }}>
                            Plantilla: <strong style={{ color: 'var(--coach-text-dark)' }}>{selectedTemplate?.name}</strong>
                        </p>
                        
                        <form onSubmit={handleAssignTemplate}>
                            <div className="coach-form-group">
                                <label className="coach-label">Seleccionar Atleta:</label>
                                <select 
                                    required 
                                    value={assignData.alumnoId} 
                                    onChange={e => setAssignData({...assignData, alumnoId: e.target.value})}
                                    className="coach-select"
                                >
                                    <option value="">Elegir jugador...</option>
                                    {athletes.map(ath => (
                                        <option key={ath.id} value={ath.id}>
                                            {ath.fullName && ath.fullName.trim() !== "" 
                                                ? ath.fullName 
                                                : (ath.username || 'Usuario sin nombre')}
                                            {ath.position ? ` - ${ath.position}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="coach-form-group">
                                <label className="coach-label">Fecha de Ejecución:</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={assignData.scheduledDate} 
                                    onChange={e => setAssignData({...assignData, scheduledDate: e.target.value})}
                                    className="coach-input"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowAssignModal(false)} className="coach-btn coach-btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="coach-btn coach-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    Confirmar Asignación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RutinasPage;