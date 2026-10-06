import { useState } from 'react';
import ImageUploadField from './ImageUploadField';

export default function HeroSlidesEditor({ title, value, onChange, folder }) {
  const entries = Array.isArray(value) ? value : [];
  const [keys, setKeys] = useState(() => entries.map(() => crypto.randomUUID()));
  const update = (index, patch) => onChange(entries.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = (index, delta) => {
    const next = [...entries];
    const nextKeys = [...keys];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    [nextKeys[index], nextKeys[index + delta]] = [nextKeys[index + delta], nextKeys[index]];
    setKeys(nextKeys);
    onChange(next);
  };
  return <section className="cms-panel">
    <h4>{title}</h4>
    <p className="cms-help">Las imágenes se muestran en este orden. Si no hay imágenes activas con URL, el sitio usa las fotos predeterminadas.</p>
    {entries.map((item, index) => <div className="cms-panel" key={keys[index] || index}>
      <div className="cms-toolbar"><strong>Imagen {index + 1}</strong><div className="cms-actions">
        <button type="button" className="cancel-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir imagen ${index + 1}`}>Subir</button>
        <button type="button" className="cancel-btn" disabled={index === entries.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar imagen ${index + 1}`}>Bajar</button>
        <button type="button" className="delete-btn" onClick={() => { setKeys(keys.filter((_, i) => i !== index)); onChange(entries.filter((_, i) => i !== index)); }}>Quitar</button>
      </div></div>
      <ImageUploadField label={`Imagen ${index + 1} — URL o archivo`} value={item?.url || ''} onChange={url => update(index, { url })} folder={folder} />
      <label>Descripción de la imagen<input value={item?.alt || ''} onChange={e => update(index, { alt: e.target.value })} /></label>
      <label className="cms-check"><input type="checkbox" checked={item?.active !== false} onChange={e => update(index, { active: e.target.checked })} />Activa</label>
    </div>)}
    <button type="button" className="save-btn" onClick={() => { setKeys([...keys, crypto.randomUUID()]); onChange([...entries, { url: '', alt: '', active: true }]); }}>Agregar imagen</button>
  </section>;
}
