import { useState, useEffect } from 'react';
import api from '../services/api';

const EjerciciosPage = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', bodyRegion: '', videoUrl: '', description: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchExercises();
    }, []);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, regionFilter]);

    const fetchExercises = async () => {
        try {
            const response = await api.get('/exercises');
            setExercises(response.data);
        } catch (err) {
            console.error("Error al cargar ejercicios", err);
        } finally { setLoading(false); }
    };
    const filteredExercises = exercises.filter(ex => {
        const matchesName = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = regionFilter === '' || ex.bodyRegion === regionFilter;
        return matchesName && matchesRegion;
    });
    const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExercises = filteredExercises.slice(indexOfFirstItem, indexOfLastItem);

    const getRegionStyle = (region) => {
        const normalized = region?.toLowerCase() || '';
        if (normalized.includes('upper') || normalized.includes('superior')) {
            return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
        }
        if (normalized.includes('lower') || normalized.includes('inferior')) {
            return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
        }
        if (normalized.includes('core')) {
            return { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' };
        }
        if (normalized.includes('full')) {
            return { backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' };
        }
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }; 
    };

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
                if (currentExercises.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
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
            setCurrentPage(1); 
        } catch (err) {
            alert("Error al importar el Excel.");
        }
    };

    const uniqueRegions = [...new Set(exercises.map(ex => ex.bodyRegion).filter(Boolean))];

    if (loading) return <p style={{padding: '20px'}}>Cargando biblioteca de ejercicios...</p>;

    return (
        <div>
            <div className="coach-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{margin: 0}}>Biblioteca de Ejercicios</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <label className="coach-btn coach-btn-success" style={{ cursor: 'pointer' }}>
                        📄 Importar Excel
                        <input type="file" accept=".xlsx, .xls" style={{display: 'none'}} onChange={handleFileUpload}/>
                    </label>
                    <button onClick={handleOpenCreate} className="coach-btn coach-btn-primary">
                        + Nuevo Ejercicio
                    </button>
                </div>
            </div>

            <div className="coach-filter-bar">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por nombre (ej: Dead Bug)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="coach-input"
                    style={{ flex: 2 }}
                />
                <select 
                    value={regionFilter} 
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="coach-select"
                    style={{ flex: 1 }}
                >
                    <option value="">Todas las Zonas</option>
                    {uniqueRegions.map((region, idx) => (
                        <option key={idx} value={region}>{region}</option>
                    ))}
                </select>
            </div>

            {showForm && (
                <div className="coach-card" style={{ borderLeft: '5px solid var(--coach-primary)' }}>
                    <h3 style={{ marginTop: 0 }}>{isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}</h3>
                    <form onSubmit={handleSave}>
                        <div className="coach-form-row">
                            <div className="coach-form-group" style={{ flex: 1 }}>
                                <label className="coach-label">Nombre del Ejercicio:</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="coach-input"/>
                            </div>
                            <div className="coach-form-group" style={{ flex: 1 }}>
                                <label className="coach-label">Región Corporal:</label>
                                <select required value={formData.bodyRegion} onChange={e => setFormData({...formData, bodyRegion: e.target.value})} className="coach-select">
                                    <option value="">Seleccionar...</option>
                                    <option value="Tren Inferior">Tren Inferior</option>
                                    <option value="Lower Body">Lower Body</option>
                                    <option value="Tren Superior">Tren Superior</option>
                                    <option value="Upper Body">Upper Body</option>
                                    <option value="Core">Core</option>
                                    <option value="Full Body">Full Body</option>
                                </select>
                            </div>
                        </div>
                        <div className="coach-form-row">
                            <div className="coach-form-group" style={{ flex: 1 }}>
                                <label className="coach-label">URL Video (YouTube):</label>
                                <input type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="coach-input"/>
                            </div>
                            <div className="coach-form-group" style={{ flex: 2 }}>
                                <label className="coach-label">Descripción / Tips:</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="coach-input"/>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="coach-btn coach-btn-danger">Cancelar</button>
                            <button type="submit" className="coach-btn coach-btn-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="coach-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="coach-table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                    <table className="coach-table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Región</th>
                                <th>Video</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentExercises.length > 0 ? (
                                currentExercises.map(ex => (
                                    <tr key={ex.id}>
                                        <td><strong>{ex.name}</strong></td>
                                        <td>
                                            <span className="coach-region-badge" style={getRegionStyle(ex.bodyRegion)}>
                                                {ex.bodyRegion || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            {ex.videoUrl ? <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{color: 'var(--coach-primary)', fontWeight: '500', textDecoration: 'none'}}>Ver Demo ▶</a> : <span style={{color: '#94a3b8'}}>-</span>}
                                        </td>
                                        <td>
                                            <button onClick={() => handleOpenEdit(ex)} className="coach-icon-btn" title="Editar">✏️</button>
                                            <button onClick={() => handleDelete(ex.id)} className="coach-icon-btn" title="Eliminar">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: 'var(--coach-text-muted)'}}>
                                        No se encontraron ejercicios con esos filtros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '15px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' 
                    }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                            Mostrando <strong>{indexOfFirstItem + 1}</strong> a <strong>{Math.min(indexOfLastItem, filteredExercises.length)}</strong> de <strong>{filteredExercises.length}</strong> ejercicios
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                                className="coach-btn coach-btn-outline"
                                style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                ◀ Anterior
                            </button>
                            
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--coach-text-dark)' }}>
                                Página {currentPage} de {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                                className="coach-btn coach-btn-outline"
                                style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                Siguiente ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EjerciciosPage;