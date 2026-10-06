import { useState } from 'react';
import { uploadMedia } from '../api';
import { Upload, Loader2 } from 'lucide-react';

// Campo de imagen con dos caminos: pegar una URL a mano (como antes) o subir un
// archivo directo, que lo manda a /api/media (Bucket S3) y llena el campo solo.
function ImageUploadField({ label, value, onChange, folder = 'general', placeholder }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const media = await uploadMedia(file, { folder });
      onChange(media.url);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(typeof apiError === 'string' ? apiError : apiError?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group full">
      <label>{label}</label>
      <div className="image-field-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <label className={`image-field-upload ${uploading ? 'uploading' : ''}`} title="Subir imagen">
          {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {error && <small style={{ color: 'var(--danger)' }}>{error}</small>}
      {value && (
        <div className="image-field-preview">
          <img src={value} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploadField;
