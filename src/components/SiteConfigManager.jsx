import { useState, useEffect } from 'react';
import { Save, Phone, MapPin, MessageCircle, Mail, Clock, Share2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSiteConfig, updateSiteConfig, getToken } from '../api';

const SECTIONS = [
  {
    id: 'quito',
    icon: Phone,
    title: 'Sucursal Quito',
    fields: [
      { key: 'phoneQuito', label: 'Teléfono', placeholder: '(02) 248-5000' },
      { key: 'addressQuito', label: 'Dirección', placeholder: 'Av. Galo Plaza Lasso N58-98 y Luis Tufiño · Ponceano' },
      { key: 'mapEmbedUrlQuito', label: 'URL Google Maps embed (opcional)', placeholder: 'https://www.google.com/maps/embed?...' },
    ],
  },
  {
    id: 'guayaquil',
    icon: Phone,
    title: 'Sucursal Guayaquil',
    fields: [
      { key: 'phoneGuayaquil', label: 'Teléfono', placeholder: '(04) 228-4000' },
      { key: 'addressGuayaquil', label: 'Dirección', placeholder: 'Av. Carlos Julio Arosemena Km 4.5' },
      { key: 'mapEmbedUrlGuayaquil', label: 'URL Google Maps embed (opcional)', placeholder: 'https://www.google.com/maps/embed?...' },
    ],
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Número sin "+" ni espacios. Se usan en los CTAs del sitio y la página de gracias.',
    fields: [
      { key: 'whatsappGeneral', label: 'WhatsApp general (landings + gracias)', placeholder: '593999999999', help: 'Ej: 593999999999 para +593 99 999 9999' },
      { key: 'whatsappSales', label: 'WhatsApp ventas (formulario de contacto)', placeholder: '593900000000' },
      { key: 'whatsappWorkshop', label: 'WhatsApp talleres', placeholder: '593900000000' },
      { key: 'whatsappQuito', label: 'WhatsApp Quito (botón flotante)', placeholder: '593900000000' },
      { key: 'whatsappGuayaquil', label: 'WhatsApp Guayaquil (botón flotante)', placeholder: '593900000000' },
      { key: 'whatsappDefaultMessage', label: 'Mensaje predeterminado', placeholder: 'Hola CORASA, estoy interesado en los camiones QINGLING Isuzu.', multiline: true },
    ],
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Correos electrónicos',
    fields: [
      { key: 'contactEmail', label: 'Email de contacto (general)', placeholder: 'contacto@corasa.com.ec' },
      { key: 'salesEmail', label: 'Email de ventas', placeholder: 'ventas@corasa.com.ec' },
    ],
  },
  {
    id: 'schedule',
    icon: Clock,
    title: 'Horarios de atención',
    description: 'Se muestran en la página de gracias y en CTAs de horario.',
    fields: [
      { key: 'scheduleWeekday', label: 'Lunes a Viernes', placeholder: 'Lunes a Viernes · 8:30 — 18:00' },
      { key: 'scheduleSaturday', label: 'Sábados', placeholder: 'Sábados · 9:00 — 13:00' },
      { key: 'scheduleSunday', label: 'Domingos', placeholder: 'Domingos · Cerrado' },
      { key: 'scheduleNote', label: 'Nota adicional', placeholder: 'Atención 24/7 en emergencias', multiline: true },
    ],
  },
  {
    id: 'social',
    icon: Share2,
    title: 'Redes sociales',
    description: 'URLs completas (con https://). Dejar vacío para ocultar.',
    fields: [
      { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://www.facebook.com/qinglingec' },
      { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://www.instagram.com/qinglingec' },
      { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://www.tiktok.com/@qinglingec' },
      { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://www.youtube.com/@qinglingec' },
      { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/qinglingec' },
    ],
  },
  {
    id: 'footer',
    icon: FileText,
    title: 'Pie de página',
    fields: [
      { key: 'footerCompanyName', label: 'Nombre empresa', placeholder: 'CORASA — QINGLING Ecuador' },
      { key: 'footerTagline', label: 'Tagline', placeholder: 'Distribuidor oficial QINGLING en Ecuador' },
      { key: 'footerCopyright', label: 'Copyright', placeholder: '© 2026 CORASA — QINGLING Motors Ecuador. Todos los derechos reservados.', multiline: true },
    ],
  },
];

function FieldInput({ field, value, onChange }) {
  if (field.multiline) {
    return (
      <div className="custom-form-group">
        <label className="custom-form-label">{field.label}</label>
        <textarea
          className="custom-form-input"
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          style={{ fontFamily: 'inherit', resize: 'vertical' }}
        />
        {field.help && <small style={{ color: 'var(--grey-text)', fontSize: '12px' }}>{field.help}</small>}
      </div>
    );
  }
  return (
    <div className="custom-form-group">
      <label className="custom-form-label">{field.label}</label>
      <input
        type="text"
        className="custom-form-input"
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
      />
      {field.help && <small style={{ color: 'var(--grey-text)', fontSize: '12px' }}>{field.help}</small>}
    </div>
  );
}

export default function SiteConfigManager() {
  const [config, setConfig] = useState({});
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSections, setOpenSections] = useState({ quito: true, guayaquil: true });

  useEffect(() => {
    const load = async () => {
      try {
        const cfg = await getSiteConfig();
        setConfig(cfg);
        setOriginal(cfg);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Error al cargar configuración');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateSiteConfig(config);
      setOriginal(updated);
      setConfig(updated);
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(original);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '800', margin: 0 }}>Configuración del Sitio</h2>
          <p style={{ color: 'var(--grey-text)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Teléfonos, direcciones, WhatsApp, redes sociales y horarios editables para toda la web.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            padding: '12px 24px',
            background: hasChanges ? 'var(--primary)' : '#cccccc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c00', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOpen = openSections[section.id] !== false;
          return (
            <div key={section.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: isOpen ? '#f9f9f9' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {section.title}
                    </h3>
                    {section.description && (
                      <small style={{ color: 'var(--grey-text)', fontSize: '12px' }}>{section.description}</small>
                    )}
                  </div>
                </div>
                <span style={{ color: 'var(--grey-text)', fontSize: '18px' }}>{isOpen ? '▾' : '▸'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e0e0e0' }}>
                  {section.fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={config[field.key]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {hasChanges && (
          <button
            onClick={() => { setConfig(original); }}
            style={{
              padding: '12px 20px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          style={{
            padding: '12px 24px',
            background: hasChanges ? 'var(--primary)' : '#cccccc',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
