import { useState, useEffect } from 'react';
import { getPages, updatePage } from '../api';

function PagesManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (err) {
      setError('Error al cargar páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      content: page.content || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updatePage(editingPage.slug, formData);
      await loadPages();
      setEditingPage(null);
      setFormData({ title: '', content: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({ title: '', content: '' });
  };

  const getPageLabel = (slug) => {
    const labels = {
      home: 'Inicio',
      nosotros: 'Nosotros',
      servicios: 'Servicios',
      contacto: 'Contacto',
      taller: 'Taller',
    };
    return labels[slug] || slug;
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="manager">
      <div className="manager-header">
        <h2>Contenido de Página</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {editingPage ? (
        <div className="form-modal">
          <div className="form-modal-content wide">
            <div className="form-modal-header">
              <h3>Editar: {getPageLabel(editingPage.slug)}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group full">
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group full">
                <label>Contenido (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="content-editor"
                  placeholder="Contenido HTML de la página..."
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="items-list">
          {pages.length === 0 ? (
            <p className="empty">No hay páginas disponibles</p>
          ) : (
            pages.map(page => (
              <div key={page.id} className="item-card">
                <div className="item-info">
                  <h3>{getPageLabel(page.slug)}</h3>
                  <p className="page-slug">/{page.slug}</p>
                  <p className="page-preview">{page.content?.slice(0, 100)}...</p>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(page)} className="edit-btn">Editar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PagesManager;
