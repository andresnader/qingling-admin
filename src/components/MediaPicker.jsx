import { useEffect, useState } from 'react';
import { getMedia, apiErrorMessage } from '../api';

export default function MediaPicker({ onSelect, onClose }) {
  const [folder, setFolder] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ media: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError('');
    getMedia(folder, page).then(data => { if (live) setResult(data); })
      .catch(err => { if (live) setError(apiErrorMessage(err, 'No se pudo cargar la biblioteca.')); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [folder, page, retry]);
  const images = result.media.filter(item => item.mimeType?.startsWith('image/'));
  return (
    <section className="cms-panel" aria-label="Elegir imagen de Multimedia">
      <div className="cms-toolbar"><h4>Biblioteca de imágenes</h4><button type="button" className="cancel-btn" onClick={onClose}>Cerrar biblioteca</button></div>
      <label>Carpeta<input value={folder} placeholder="Todas las carpetas" onChange={e => { setFolder(e.target.value); setPage(1); }} /></label>
      {error && <div className="error-message" role="alert">{error} <button type="button" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div>}
      {loading ? <p>Cargando...</p> : !error && <>
        <div className="media-grid">{images.map(item => <button type="button" className="media-card media-choice" key={item.id} onClick={() => onSelect(item)}>
          <span className="media-thumb"><img src={item.url} alt={item.alt || ''} loading="lazy" /></span>
          <span className="media-card-body">{item.alt || item.key?.split('/').pop() || 'Elegir imagen'}</span>
        </button>)}</div>
        {!images.length && <p>No hay imágenes en esta página de la biblioteca.</p>}
        <div className="media-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(n => n - 1)}>Anterior</button><span>Página {page} de {Math.max(1, result.pages)}</span><button type="button" disabled={page >= result.pages} onClick={() => setPage(n => n + 1)}>Siguiente</button></div>
      </>}
    </section>
  );
}
