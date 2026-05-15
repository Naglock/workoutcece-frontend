import { useState, useEffect } from 'react';
import api from '../services/api';

const EjerciciosPage = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS PARA BÚSQUEDA Y FILTROS ---
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('');

    // Estados para el Modal/Formulario
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', bodyRegion: '', videoUrl: '', description: '' });

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await api.get('/exercises');
            setExercises(response.data);
        } catch (err) {
            console.error("Error al cargar ejercicios", err);
        } finally { setLoading(false); }
    };

    // --- LÓGICA DE FILTRADO (Buscador en Memoria) ---
    const filteredExercises = exercises.filter(ex => {
        const matchesName = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        // Si no hay filtro de región seleccionado, pasa. Si hay, debe coincidir.
        const matchesRegion = regionFilter === '' || ex.bodyRegion === regionFilter;
        return matchesName && matchesRegion;
    });

    // --- LÓGICA DE COLORES PARA LAS ZONAS DEL CUERPO ---
    const getRegionStyle = (region) => {
        const normalized = region?.toLowerCase() || '';
        if (normalized.includes('upper') || normalized.includes('superior')) {
            return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }; // Azul
        }
        if (normalized.includes('lower') || normalized.includes('inferior')) {
            return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }; // Verde
        }
        if (normalized.includes('core')) {
            return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }; // Naranja
        }
        if (normalized.includes('full')) {
            return { backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' }; // Morado
        }
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }; // Gris por defecto
    };

    // --- MANEJO DEL FORMULARIO ---
    const handleOpenCreate = () => {
        setFormData({ id: null, name: '', bodyRegion: '', videoUrl: '', description: '' });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleOpenEdit = (exercise) => {
        setFormData(exercise);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/exercises/${formData.id}`, formData);
                alert("Ejercicio actualizado.");
            } else {
                await api.post('/exercises', formData);
                alert("Ejercicio creado exitosamente.");
            }
            setShowForm(false);
            fetchExercises();
        } catch (err) {
            alert("Error al guardar. Verifica que el nombre no esté duplicado.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este ejercicio?")) {
            try {
                await api.delete(`/exercises/${id}`);
                fetchExercises();
            } catch (err) {
                alert("No se puede eliminar: El ejercicio ya está asignado a la rutina de un atleta.");
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            await api.post('/exercises/import', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Biblioteca importada exitosamente desde Excel");
            fetchExercises();
        } catch (err) {
            alert("Error al importar el Excel.");
        }
    };

    // Obtener lista única de regiones para el dropdown del filtro
    const uniqueRegions = [...new Set(exercises.map(ex => ex.bodyRegion).filter(Boolean))];

    if (loading) return <p style={{padding: '20px'}}>Cargando biblioteca de ejercicios...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{margin: 0, color: '#1e293b'}}>Biblioteca de Ejercicios</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <label style={styles.importBtn}>
                        📄 Importar Excel
                        <input type="file" accept=".xlsx, .xls" style={{display: 'none'}} onChange={handleFileUpload}/>
                    </label>
                    <button onClick={handleOpenCreate} style={styles.createBtn}>+ Nuevo Ejercicio</button>
                </div>
            </div>

            {/* BARRAS DE BÚSQUEDA Y FILTRO */}
            <div style={styles.filterContainer}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por nombre (ej: Dead Bug)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <select 
                    value={regionFilter} 
                    onChange={(e) => setRegionFilter(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="">Todas las Zonas</option>
                    {uniqueRegions.map((region, idx) => (
                        <option key={idx} value={region}>{region}</option>
                    ))}
                </select>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h3>{isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}</h3>
                    <form onSubmit={handleSave} style={styles.formGrid}>
                        <div>
                            <label>Nombre del Ejercicio:</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input}/>
                        </div>
                        <div>
                            <label>Región Corporal:</label>
                            <select required value={formData.bodyRegion} onChange={e => setFormData({...formData, bodyRegion: e.target.value})} style={styles.input}>
                                <option value="">Seleccionar...</option>
                                <option value="Tren Inferior">Tren Inferior</option>
                                <option value="Lower Body">Lower Body</option>
                                <option value="Tren Superior">Tren Superior</option>
                                <option value="Upper Body">Upper Body</option>
                                <option value="Core">Core</option>
                                <option value="Full Body">Full Body</option>
                            </select>
                        </div>
                        <div>
                            <label>URL Video (YouTube):</label>
                            <input type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} style={styles.input}/>
                        </div>
                        <div>
                            <label>Descripción / Tips:</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input}/>
                        </div>
                        <div style={styles.formActions}>
                            <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancelar</button>
                            <button type="submit" style={styles.saveBtn}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Región</th>
                            <th style={styles.th}>Video</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExercises.length > 0 ? (
                            filteredExercises.map(ex => (
                                <tr key={ex.id} style={styles.tr}>
                                    <td style={styles.td}><strong>{ex.name}</strong></td>
                                    <td style={styles.td}>
                                        {/* Aplicamos los estilos dinámicos al badge */}
                                        <span style={{...styles.badge, ...getRegionStyle(ex.bodyRegion)}}>
                                            {ex.bodyRegion || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {ex.videoUrl ? <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>Ver Demo</a> : '-'}
                                    </td>
                                    <td style={styles.td}>
                                        <button onClick={() => handleOpenEdit(ex)} style={styles.actionBtnEdit} title="Editar">✏️</button>
                                        <button onClick={() => handleDelete(ex.id)} style={styles.actionBtnDel} title="Eliminar">🗑️</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                    No se encontraron ejercicios con esos filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    
    // Contenedor de filtros
    filterContainer: { display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    searchInput: { flex: 2, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' },
    filterSelect: { flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: 'white' },
    
    createBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    importBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-block' },
    formCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #3b82f6' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', alignItems: 'end' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '5px', boxSizing: 'border-box' },
    formActions: { display: 'flex', gap: '10px' },
    saveBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
    cancelBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
    tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '12px', color: '#64748b', borderBottom: '2px solid #f1f5f9', textTransform: 'uppercase', fontSize: '12px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px', color: '#334155' },
    
    // Estilo base del badge (los colores se sobreescriben dinámicamente)
    badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', textAlign: 'center', minWidth: '80px' },
    
    actionBtnEdit: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '10px', transition: 'transform 0.1s' },
    actionBtnDel: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', transition: 'transform 0.1s' }
};

export default EjerciciosPage;