import { useEffect, useState } from 'react';
import { getFormDefinitions, createFormDefinition, updateFormDefinition, deleteFormDefinition, apiErrorMessage } from '../api';

const blankField = () => ({ name: '', label: '', type: 'text', required: false, options: [], placeholder: '', editorKey: crypto.randomUUID() });
const blankForm = () => ({ slug: '', title: '', description: '', notifyEmail: '', active: true, fields: [blankField()] });
const TYPES = { text: 'Texto', email: 'Email', tel: 'Teléfono', select: 'Lista de opciones', textarea: 'Texto largo', date: 'Fecha' };

export default function FormDefinitionsManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(blankForm);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    getFormDefinitions().then(data => { if (live) setForms(data); })
      .catch(err => { if (live) setError(apiErrorMessage(err, 'No se pudieron cargar los formularios.')); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [refresh]);
  const edit = form => {
    setError(''); setEditing(form?.slug || '');
    setDraft(form ? { ...form, fields: form.fields.map(field => ({ ...field, editorKey: crypto.randomUUID() })) } : blankForm());
  };
  const fieldChange = (index, patch) => setDraft(prev => ({ ...prev, fields: prev.fields.map((field, i) => i === index ? { ...field, ...patch } : field) }));
  const moveField = (index, delta) => setDraft(prev => {
    const fields = [...prev.fields];
    [fields[index], fields[index + delta]] = [fields[index + delta], fields[index]];
    return { ...prev, fields };
  });
  const save = async e => {
    e.preventDefault(); setError('');
    const fields = draft.fields.map(field => ({ name: field.name.trim(), label: field.label.trim(), type: field.type, required: field.required, placeholder: field.placeholder, options: field.type === 'select' ? field.options.map(s => s.trim()).filter(Boolean) : [] }));
    if (!draft.title.trim() || fields.some(field => !field.name || !field.label)) { setError('El título, el nombre interno y la etiqueta no pueden estar vacíos.'); return; }
    if (!fields.length) { setError('Agrega al menos un campo.'); return; }
    if (new Set(fields.map(field => field.name)).size !== fields.length || fields.some(field => ['pageSlug', 'utm', '__proto__', 'constructor', 'prototype'].includes(field.name))) { setError('Los nombres de campos deben ser únicos y no pueden usar nombres reservados (pageSlug, utm, __proto__, constructor, prototype).'); return; }
    if (fields.some(field => field.type === 'select' && !field.options.length)) { setError('Cada lista debe tener al menos una opción.'); return; }
    const payload = { slug: draft.slug.trim(), title: draft.title.trim(), description: draft.description, notifyEmail: draft.notifyEmail.trim(), active: draft.active, fields };
    setBusy(true);
    try { if (editing) await updateFormDefinition(editing, payload); else await createFormDefinition(payload); setEditing(null); setRefresh(n => n + 1); }
    catch (err) { setError(apiErrorMessage(err, 'No se pudo guardar el formulario.')); }
    finally { setBusy(false); }
  };
  const remove = async form => {
    if (!window.confirm(`¿Eliminar el formulario "${form.title}"? Los leads existentes se conservan.`)) return;
    setBusy(true); setError('');
    try { await deleteFormDefinition(form.slug); setRefresh(n => n + 1); }
    catch (err) { setError(apiErrorMessage(err, 'No se pudo eliminar el formulario.')); }
    finally { setBusy(false); }
  };
  return <>
    {editing === null && <div className="cms-toolbar"><h3>Formularios dinámicos</h3><button type="button" className="save-btn" onClick={() => edit(null)}>Crear formulario</button></div>}
    {editing !== null ? <div className="form-modal"><div className="form-modal-content wide" role="dialog" aria-modal="true" aria-label={editing ? 'Editar formulario' : 'Crear formulario'}>
      <div className="form-modal-header"><h3>{editing ? 'Editar formulario' : 'Crear formulario'}</h3><button type="button" className="close-btn" aria-label="Cerrar" disabled={busy} onClick={() => setEditing(null)}>×</button></div>
      <form onSubmit={save}><fieldset disabled={busy} className="cms-fieldset">
        {error && <div className="error-message" role="alert">{error}</div>}
        <div className="form-row"><label className="form-group">Slug<input required pattern="[a-z0-9-]+" value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} placeholder="campana-qingling" /></label><label className="form-group">Título<input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label></div>
        <label className="form-group">Descripción<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
        <label className="form-group">Email de notificación<input type="email" value={draft.notifyEmail} onChange={e => setDraft({ ...draft, notifyEmail: e.target.value })} placeholder="Vacío: email predeterminado" /></label>
        <label className="cms-check"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} />Activo</label>
        <h4>Campos</h4>
        {draft.fields.map((field, index) => <section className="cms-panel" key={field.editorKey}>
          <div className="cms-toolbar"><strong>Campo {index + 1}</strong><div className="cms-actions"><button type="button" className="cancel-btn" disabled={index === 0} onClick={() => moveField(index, -1)}>Subir</button><button type="button" className="cancel-btn" disabled={index === draft.fields.length - 1} onClick={() => moveField(index, 1)}>Bajar</button><button type="button" className="delete-btn" onClick={() => setDraft(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }))}>Quitar</button></div></div>
          <div className="form-row"><label className="form-group">Nombre interno<input required value={field.name} onChange={e => fieldChange(index, { name: e.target.value })} /></label><label className="form-group">Etiqueta<input required value={field.label} onChange={e => fieldChange(index, { label: e.target.value })} /></label></div>
          <div className="form-row"><label className="form-group">Tipo<select value={field.type} onChange={e => fieldChange(index, { type: e.target.value })}>{Object.entries(TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="form-group">Placeholder<input value={field.placeholder} onChange={e => fieldChange(index, { placeholder: e.target.value })} /></label></div>
          <label className="cms-check"><input type="checkbox" checked={field.required} onChange={e => fieldChange(index, { required: e.target.checked })} />Requerido</label>
          {field.type === 'select' && <label className="form-group">Opciones (una por línea)<textarea required rows={4} value={field.options.join('\n')} onChange={e => fieldChange(index, { options: e.target.value.split('\n') })} /></label>}
        </section>)}
        <button type="button" className="cancel-btn" onClick={() => setDraft(prev => ({ ...prev, fields: [...prev.fields, blankField()] }))}>Agregar campo</button>
        <div className="form-actions"><button type="button" className="cancel-btn" onClick={() => setEditing(null)}>Cancelar</button><button type="submit" className="save-btn">{busy ? 'Guardando...' : 'Guardar formulario'}</button></div>
      </fieldset></form>
    </div></div> : <>
      {error && <div className="error-message" role="alert">{error}</div>}
      {loading ? <div className="loading">Cargando formularios...</div> : <div className="items-list">{!forms.length && <p className="empty">No hay formularios dinámicos.</p>}{forms.map(form => <article className="item-card" key={form.id || form.slug}><div className="item-info"><h3>{form.title}</h3><p>{form.slug} · {form.active ? 'Activo' : 'Inactivo'} · {form.fields.length} campos</p><p>{form.description}</p></div><div className="item-actions"><button type="button" className="edit-btn" disabled={busy} onClick={() => edit(form)}>Editar</button><button type="button" className="delete-btn" disabled={busy} onClick={() => remove(form)}>Eliminar</button></div></article>)}</div>}
    </>}
  </>;
}
