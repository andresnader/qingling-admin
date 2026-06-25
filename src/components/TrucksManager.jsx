import { useState, useEffect } from 'react';
import { getTrucks, createTruck, updateTruck, deleteTruck } from '../api';

const emptyTruck = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: 'LIVIANO',
  image: '',
  gallery: [],
  specs: {
    engine: '',
    power: '',
    torque: '',
    transmission: '',
    loadCapacity: '',
    fuelTank: '',
    dimensions: '',
    weight: '',
  },
  features: [],
  featured: false,
  active: true,
};

function TrucksManager() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [formData, setFormData] = useState(emptyTruck);
  const [saving, setSaving] = useState(false);

  const loadTrucks = async () => {
    try {
      setLoading(true);
      const data = await getTrucks();
      setTrucks(data);
    } catch {
      setError('Error al cargar camiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrucks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingTruck) {
        await updateTruck(editingTruck.id, formData);
      } else {
        await createTruck(formData);
      }
      await loadTrucks();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData({
      name: truck.name || '',
      slug: truck.slug || '',
      tagline: truck.tagline || '',
      description: truck.description || '',
      category: truck.category || 'LIVIANO',
      image: truck.image || '',
      gallery: truck.gallery || [],
      specs: truck.specs || emptyTruck.specs,
      features: truck.features || [],
      featured: truck.featured || false,
      active: truck.active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este camión?')) return;
    try {
      await deleteTruck(id);
      await loadTrucks();
    } catch {
      setError('Error al eliminar');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTruck(null);
    setFormData(emptyTruck);
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Camiones</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="add-btn">
          + Agregar Camión
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-modal-header">
              <h3>{editingTruck ? 'Editar Camión' : 'Nuevo Camión'}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ej: qingling-cursor"
                    required
                  />
                </div>
                <div className="form-group full">
                  <label>Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Descripción corta"
                  />
                </div>
                <div className="form-group full">
                  <label>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="LIVIANO">Livianos</option>
                    <option value="MEDIANO">Medianos</option>
                    <option value="TRACTO">Tractos</option>
                    <option value="BUS">Buses</option>
                    <option value="ESPECIAL">Especiales</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL Imagen principal</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Destacado</label>
                  <select
                    value={formData.featured ? 'true' : 'false'}
                    onChange={e => setFormData(prev => ({ ...prev, featured: e.target.value === 'true' }))}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>

              <h4>Especificaciones</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Motor</label>
                  <input
                    type="text"
                    value={formData.specs.engine}
                    onChange={e => handleSpecChange('engine', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Potencia</label>
                  <input
                    type="text"
                    value={formData.specs.power}
                    onChange={e => handleSpecChange('power', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Torque</label>
                  <input
                    type="text"
                    value={formData.specs.torque}
                    onChange={e => handleSpecChange('torque', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Transmisión</label>
                  <input
                    type="text"
                    value={formData.specs.transmission}
                    onChange={e => handleSpecChange('transmission', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Capacidad de Carga</label>
                  <input
                    type="text"
                    value={formData.specs.loadCapacity}
                    onChange={e => handleSpecChange('loadCapacity', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tanque de Combustible</label>
                  <input
                    type="text"
                    value={formData.specs.fuelTank}
                    onChange={e => handleSpecChange('fuelTank', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Dimensiones</label>
                  <input
                    type="text"
                    value={formData.specs.dimensions}
                    onChange={e => handleSpecChange('dimensions', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Peso</label>
                  <input
                    type="text"
                    value={formData.specs.weight}
                    onChange={e => handleSpecChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="items-list">
        {trucks.length === 0 ? (
          <p className="empty">No hay camiones registrados</p>
        ) : (
          trucks.map(truck => (
            <div key={truck.id} className="item-card">
              <div className="item-info">
                <h3>{truck.name}</h3>
                <p>{truck.tagline || truck.description?.slice(0, 80)}</p>
                <span className={`badge ${truck.category}`}>{truck.category}</span>
                {truck.featured && <span className="badge featured">Destacado</span>}
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(truck)} className="edit-btn">Editar</button>
                <button onClick={() => handleDelete(truck.id)} className="delete-btn">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TrucksManager;
