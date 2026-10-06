import { useState, useEffect, useCallback } from 'react';
import { getMedia, uploadMedia, deleteMedia } from '../api';
import { Image as ImageIcon, FileVideo, File, Copy, Trash2, Upload, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 24;

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaThumb({ item }) {
  if (item.mimeType?.startsWith('image/')) {
    return <img src={item.url} alt={item.alt || ''} loading="lazy" />;
  }
  if (item.mimeType?.startsWith('video/')) {
    return <video src={item.url} muted />;
  }
  const Icon = item.mimeType?.startsWith('video/') ? FileVideo : File;
  return <Icon size={36} className="media-file-icon" />;
}

function MediaCard({ item, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copiá la URL:', item.url);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este archivo? No se puede deshacer.')) return;
    setDeleting(true);
    try {
      await deleteMedia(item.id);
      onDelete(item.id);
    } catch {
      alert('No se pudo eliminar el archivo.');
      setDeleting(false);
    }
  };

  const filename = item.key?.split('/').pop() || item.url;

  return (
    <div className="media-card">
      <div className="media-thumb">
        <MediaThumb item={item} />
      </div>
      <div className="media-card-body">
        <span className="media-card-name" title={filename}>{filename}</span>
        <span className="media-card-name" style={{ opacity: 0.7 }}>{formatSize(item.size)}</span>
        <div className="media-card-actions">
          <button
            type="button"
            className={`media-icon-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copiar URL"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copiada' : 'Copiar'}
          </button>
          <button
            type="button"
            className="media-icon-btn danger"
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaManager() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [folder, setFolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (targetPage = 1, targetFolder = folder) => {
    try {
      setLoading(true);
      setError('');
      const data = await getMedia(targetFolder, targetPage, PAGE_SIZE);
      setItems(data.media || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(data.page || targetPage);
    } catch {
      setError('No se pudo cargar la biblioteca multimedia.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(1, folder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadMedia(file, { folder: folder || 'general' });
      await load(1, folder);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(typeof apiError === 'string' ? apiError : apiError?.message || 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  return (
    <div>
      <div className="manager-header">
        <h2>Multimedia</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="media-toolbar">
        <input
          type="text"
          className="media-folder-select"
          placeholder="Filtrar por carpeta (ej: camiones, landings)"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        />
        <label className={`media-upload-btn ${uploading ? '' : ''}`}>
          <Upload size={15} />
          {uploading ? 'Subiendo...' : 'Subir archivo'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,application/pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <span className="media-count">{total} archivo{total === 1 ? '' : 's'}</span>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="empty">
          <ImageIcon size={32} style={{ marginBottom: 10, color: 'var(--text-faint)' }} />
          <div>Todavía no hay archivos{folder ? ` en "${folder}"` : ''}.</div>
        </div>
      ) : (
        <>
          <div className="media-grid">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>

          {pages > 1 && (
            <div className="media-pagination">
              <button type="button" onClick={() => load(page - 1, folder)} disabled={page <= 1}>
                <ChevronLeft size={16} />
              </button>
              <span>Página {page} de {pages}</span>
              <button type="button" onClick={() => load(page + 1, folder)} disabled={page >= pages}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MediaManager;
