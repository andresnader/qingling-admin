import { useState, useEffect } from 'react';
import { getPages, updatePage } from '../api';

function PagesManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    heroPosition: 'center-center',
    content: '',
    heroImage: ''
  });
  const [saving, setSaving] = useState(false);

  const positions = [
    { value: 'top-left', label: 'Arriba Izquierda' },
    { value: 'top-center', label: 'Arriba Centro' },
    { value: 'top-right', label: 'Arriba Derecha' },
    { value: 'center-left', label: 'Centro Izquierda' },
    { value: 'center-center', label: 'Centro Centro' },
    { value: 'center-right', label: 'Centro Derecha' },
    { value: 'bottom-left', label: 'Abajo Izquierda' },
    { value: 'bottom-center', label: 'Abajo Centro' },
    { value: 'bottom-right', label: 'Abajo Derecha' },
  ];

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch {
      setError('Error al cargar páginas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPages();
  }, []);

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      subtitle: page.subtitle || '',
      ctaText: page.ctaText || '',
      ctaLink: page.ctaLink || '',
      heroPosition: page.heroPosition || 'center-center',
      content: page.content || '',
      heroImage: page.heroImage || ''
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
      setFormData({ title: '', subtitle: '', ctaText: '', ctaLink: '', heroPosition: 'center-center', content: '', heroImage: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({ title: '', subtitle: '', ctaText: '', ctaLink: '', heroPosition: 'center-center', content: '', heroImage: '' });
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
              <div className="form-row">
                <div className="form-group">
                  <label> Título Principal</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="QINGLING MOTORS"
                  />
                </div>
                <div className="form-group">
                  <label> Subtítulo</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="POWERED BY ISUZU"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Texto del CTA</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={e => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="VER MODELOS"
                  />
                </div>
                <div className="form-group">
                  <label>Link del CTA</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={e => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                    placeholder="#modelos"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Posición del Hero</label>
                  <select
                    value={formData.heroPosition}
                    onChange={e => setFormData(prev => ({ ...prev, heroPosition: e.target.value }))}
                  >
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>URL de Imagen Hero</label>
                  <input
                    type="text"
                    value={formData.heroImage}
                    onChange={e => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                    placeholder="/images/camion-hero.webp"
                  />
                </div>
              </div>
              <div className="form-group full">
                <label>Contenido (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
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
                  <p className="page-preview">
                    Título: {page.title || '—'} | Posición: {page.heroPosition || '—'}
                  </p>
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
