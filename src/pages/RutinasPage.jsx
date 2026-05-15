import { useState, useEffect } from 'react';
import api from '../services/api';
import PlanificadorRutina from '../components/PlanificadorRutina';
import { globalStyles, colors } from '../styles/globalStyles'; 

const RutinasPage = () => {
    const [templates, setTemplates] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [showBuilder, setShowBuilder] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateToEdit, setTemplateToEdit] = useState(null); 
    
    // Formulario de asignación
    const [assignData, setAssignData] = useState({ alumnoId: '', scheduledDate: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Obtenemos las plantillas del coach
            const tempRes = await api.get('/workouts/templates');
            setTemplates(tempRes.data);

            // 2. Obtenemos la lista de atletas
            const athRes = await api.get('/coach/athletes'); 
            setAthletes(Array.isArray(athRes.data) ? athRes.data : []);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE ASIGNACIÓN ---
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

    // --- LÓGICA DE EDICIÓN ---
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

    // --- LÓGICA DE ELIMINACIÓN ---
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

    if (loading) return <p style={{padding: '20px', textAlign: 'center', color: colors.textMuted}}>Cargando biblioteca de rutinas...</p>;

    return (
        <div style={globalStyles.pageContainer}>
            <div style={globalStyles.pageHeader}>
                <div>
                    <h2 style={globalStyles.title}>Biblioteca de Rutinas</h2>
                    <p style={globalStyles.subtitle}>Crea plantillas base y asígnalas rápidamente a tu alumno.</p>
                </div>
                <button 
                    onClick={() => {
                        setShowBuilder(!showBuilder);
                        if (showBuilder) setTemplateToEdit(null); // Limpiamos el estado si cerramos el creador
                    }} 
                    style={showBuilder ? globalStyles.btnCancel : globalStyles.btnPrimary}
                >
                    {showBuilder ? '✕ Cerrar Creador' : '+ Nueva Plantilla Base'}
                </button>
            </div>

            {showBuilder && (
                <div style={{ borderTop: `2px dashed ${colors.border}`, paddingTop: '24px', marginBottom: '40px' }}>
                    <h3 style={{ color: colors.textDark, marginBottom: '20px', fontSize: '20px' }}>
                        {templateToEdit ? 'Editando Plantilla' : 'Diseñar Nueva Plantilla'}
                    </h3>
                    {/* Pasamos initialTemplate y onSaveSuccess al Planificador */}
                    <PlanificadorRutina 
                        isTemplateMode={true} 
                        alumnoId={null} 
                        initialTemplate={templateToEdit}
                        onSaveSuccess={handleSaveSuccess}
                    />
                </div>
            )}

            {!showBuilder && (
                <div style={globalStyles.grid}>
                    {templates.length === 0 ? (
                        <p style={globalStyles.emptyMsg}>No tienes plantillas creadas. Diseña una base de entrenamiento para empezar.</p>
                    ) : (
                        templates.map(template => (
                            <div key={template.id} style={globalStyles.card}>
                                <div style={globalStyles.cardHeader}>
                                    <h3 style={globalStyles.cardTitle}>{template.name}</h3>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={globalStyles.badge}>{template.exercises?.length || 0} Ejercicios</span>
                                        
                                        {/* Botón de Editar (Lápiz Azul) */}
                                        <button 
                                            onClick={() => handleEditTemplate(template)}
                                            style={{...globalStyles.btnDangerIcon, backgroundColor: '#e0f2fe', color: '#0284c7'}}
                                            title="Editar Plantilla"
                                        >
                                            ✏️
                                        </button>

                                        {/* Botón de Eliminar (Basurero Rojo) */}
                                        <button 
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            style={globalStyles.btnDangerIcon}
                                            title="Eliminar Plantilla"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <p style={{ color: colors.textMuted, margin: '0 0 24px 0', fontSize: '14px' }}>
                                    Bloques de trabajo: <strong style={{ color: colors.textDark }}>{new Set(template.exercises?.map(e => e.blockName)).size}</strong>
                                </p>
                                
                                <div style={{ marginTop: 'auto' }}>
                                    <button onClick={() => openAssignModal(template)} style={globalStyles.btnSuccess}>
                                        🎯 Asignar a Jugador
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showAssignModal && (
                <div style={globalStyles.modalOverlay}>
                    <div style={globalStyles.modalContent}>
                        <h3 style={{marginTop: 0, color: colors.textDark}}>Asignar Rutina</h3>
                        <p style={{color: colors.textMuted, marginBottom: '24px'}}>
                            Plantilla: <strong style={{color: colors.textDark}}>{selectedTemplate?.name}</strong>
                        </p>
                        
                        <form onSubmit={handleAssignTemplate} style={globalStyles.formGroup}>
                            <div>
                                <label style={globalStyles.label}>Seleccionar Atleta:</label>
                                <select 
                                    required 
                                    value={assignData.alumnoId} 
                                    onChange={e => setAssignData({...assignData, alumnoId: e.target.value})}
                                    style={globalStyles.input}
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

                            <div>
                                <label style={globalStyles.label}>Fecha de Ejecución:</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={assignData.scheduledDate} 
                                    onChange={e => setAssignData({...assignData, scheduledDate: e.target.value})}
                                    style={globalStyles.input}
                                />
                            </div>

                            <div style={globalStyles.modalActions}>
                                <button type="button" onClick={() => setShowAssignModal(false)} style={{...globalStyles.btnCancel, flex: 1}}>Cancelar</button>
                                <button type="submit" style={{...globalStyles.btnPrimary, flex: 1}}>Confirmar Asignación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RutinasPage;