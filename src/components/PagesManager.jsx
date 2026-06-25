import { useState, useEffect } from 'react';
import { getPages, updatePage } from '../api';

// Editable copy blocks per page (keys must match the frontend's fallback keys).
const BLOCK_DEFS = {
  home: [
    { key: 'introBadge', label: 'Intro — Badge' },
    { key: 'introLead', label: 'Intro — Titular' },
    { key: 'introP1', label: 'Intro — Párrafo 1', multiline: true },
    { key: 'introP2', label: 'Intro — Párrafo 2', multiline: true },
    { key: 'cardTitle', label: 'Tarjeta interior — Título' },
    { key: 'cardDesc', label: 'Tarjeta interior — Descripción', multiline: true },
    { key: 'modelsHeading', label: 'Encabezado de modelos' },
  ],
  nosotros: [
    { key: 'cardTitle', label: 'Tarjeta CORASA — Título' },
    { key: 'cardSubtitle', label: 'Tarjeta CORASA — Subtítulo' },
    { key: 'cardLead', label: 'Tarjeta CORASA — Texto', multiline: true },
    { key: 'bullet1Title', label: 'Bullet 1 — Título' },
    { key: 'bullet1Desc', label: 'Bullet 1 — Texto', multiline: true },
    { key: 'bullet2Title', label: 'Bullet 2 — Título' },
    { key: 'bullet2Desc', label: 'Bullet 2 — Texto', multiline: true },
    { key: 'bullet3Title', label: 'Bullet 3 — Título' },
    { key: 'bullet3Desc', label: 'Bullet 3 — Texto', multiline: true },
    { key: 'porQueTitle', label: 'Por qué CORASA — Título' },
    { key: 'porQueSubtitle', label: 'Por qué CORASA — Subtítulo' },
    { key: 'porQueP1', label: 'Por qué CORASA — Párrafo 1', multiline: true },
    { key: 'porQueP2', label: 'Por qué CORASA — Párrafo 2', multiline: true },
    { key: 'porQueP3', label: 'Por qué CORASA — Párrafo 3', multiline: true },
    { key: 'presenceTitle', label: 'Mapa de presencia — Título' },
    { key: 'presenceSubtitle', label: 'Mapa de presencia — Subtítulo', multiline: true },
  ],
};

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
    heroImage: '',
    blocks: {}
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
      heroImage: page.heroImage || '',
      blocks: page.blocks || {}
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
      setFormData({ title: '', subtitle: '', ctaText: '', ctaLink: '', heroPosition: 'center-center', content: '', heroImage: '', blocks: {} });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({ title: '', subtitle: '', ctaText: '', ctaLink: '', heroPosition: 'center-center', content: '', heroImage: '', blocks: {} });
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
              {BLOCK_DEFS[editingPage.slug] && (
                <div className="form-group full">
                  <h4 style={{ margin: '8px 0 4px' }}>Textos de la página</h4>
                  {BLOCK_DEFS[editingPage.slug].map((field) => (
                    <div className="form-group full" key={field.key}>
                      <label>{field.label}</label>
                      {field.multiline ? (
                        <textarea
                          value={formData.blocks?.[field.key] || ''}
                          onChange={e => setFormData(prev => ({ ...prev, blocks: { ...prev.blocks, [field.key]: e.target.value } }))}
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData.blocks?.[field.key] || ''}
                          onChange={e => setFormData(prev => ({ ...prev, blocks: { ...prev.blocks, [field.key]: e.target.value } }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group full">
                <label>Contenido (HTML) — opcional</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
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
