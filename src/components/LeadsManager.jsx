import { useEffect, useState } from 'react';
import { getSubmissions, markSubmissionRead, apiErrorMessage } from '../api';
import FormDefinitionsManager from './FormDefinitionsManager';

const TYPES = { CONTACT: 'Contacto', WORKSHOP: 'Taller', DYNAMIC: 'Formulario dinámico' };
const displayValue = value => typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value ?? '—');

function Inbox() {
  const [type, setType] = useState('');
  const [read, setRead] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ submissions: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError('');
    getSubmissions({ page, type: type || undefined, read: read || undefined }).then(data => {
      if (!live) return;
      if (page > Math.max(1, data.pages)) { setPage(Math.max(1, data.pages)); return; }
      setResult(data);
    }).catch(err => { if (live) setError(apiErrorMessage(err, 'No se pudieron cargar los leads.')); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [page, type, read, refresh]);
  const toggleRead = async submission => {
    setBusy(submission.id);
    setError('');
    try { await markSubmissionRead(submission.id, !submission.read); setRefresh(n => n + 1); }
    catch (err) { setError(apiErrorMessage(err, 'No se pudo cambiar el estado del lead.')); }
    finally { setBusy(null); }
  };
  return <>
    <div className="cms-toolbar">
      <label>Origen<select value={type} onChange={e => { setType(e.target.value); setPage(1); }}><option value="">Todos</option>{Object.entries(TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Estado<select value={read} onChange={e => { setRead(e.target.value); setPage(1); }}><option value="">Todos</option><option value="false">No leídos</option><option value="true">Leídos</option></select></label>
      <button type="button" className="cancel-btn" disabled={loading || !!busy} onClick={() => setRefresh(n => n + 1)}>Actualizar</button>
    </div>
    {error && <div className="error-message" role="alert">{error}</div>}
    {loading ? <div className="loading">Cargando leads...</div> : <>
      <p className="cms-help">{result.total} leads · más recientes primero</p>
      {!result.submissions.length && <p className="empty">No hay leads para estos filtros.</p>}
      <div className="items-list">{result.submissions.map(submission => <article className="cms-panel" key={submission.id}>
        <div className="cms-toolbar"><div><h3>{submission.data?.nombre || submission.data?.name || submission.data?.email || 'Sin nombre'}</h3><p>{TYPES[submission.type] || submission.type}{submission.formSlug ? ` · ${submission.formSlug}` : ''}{submission.pageSlug ? ` · /${submission.pageSlug}` : ''}</p><time dateTime={submission.createdAt}>{new Date(submission.createdAt).toLocaleString('es-EC')}</time></div>
          <div className="cms-actions"><span className={submission.read ? 'cms-help' : 'cms-unread'}>{submission.read ? 'Leído' : 'No leído'}</span><button type="button" className="edit-btn" disabled={!!busy} onClick={() => toggleRead(submission)}>{busy === submission.id ? 'Guardando...' : submission.read ? 'Marcar no leído' : 'Marcar leído'}</button></div>
        </div>
        <p className="cms-help">{[submission.data?.email, submission.data?.telefono || submission.data?.phone].filter(Boolean).map(displayValue).join(' · ')}</p>
        {submission.data?.mensaje && <p className="lead-preview">{displayValue(submission.data.mensaje)}</p>}
        <details><summary>Ver datos del envío</summary><dl className="lead-data">{Object.entries(submission.data || {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{displayValue(value)}</dd></div>)}</dl></details>
      </article>)}</div>
      <div className="media-pagination"><button type="button" disabled={page <= 1 || !!busy} onClick={() => setPage(n => n - 1)}>Anterior</button><span>Página {page} de {Math.max(1, result.pages)}</span><button type="button" disabled={page >= result.pages || !!busy} onClick={() => setPage(n => n + 1)}>Siguiente</button></div>
    </>}
  </>;
}

export default function LeadsManager() {
  const [view, setView] = useState('inbox');
  return <div className="manager"><div className="manager-header"><h2>Leads y formularios</h2></div>
    <div className="cms-toolbar"><button type="button" className={view === 'inbox' ? 'save-btn' : 'cancel-btn'} onClick={() => setView('inbox')}>Bandeja de leads</button><button type="button" className={view === 'forms' ? 'save-btn' : 'cancel-btn'} onClick={() => setView('forms')}>Formularios dinámicos</button></div>
    {view === 'inbox' ? <Inbox /> : <FormDefinitionsManager />}
  </div>;
}
