import { useState } from 'react';
import { changePassword } from '../api';

// Autoservicio para rotar la contraseña del usuario logueado.
// Es la vía recomendada para reemplazar la contraseña que se definió
// al crear el admin (ver ADMIN_SEED_PASSWORD en el backend).
function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 10) {
      setError('La nueva contraseña debe tener al menos 10 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(
        typeof apiError === 'string'
          ? apiError
          : apiError?.message || 'Error al cambiar la contraseña'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-modal-content">
        <div className="form-modal-header">
          <h3>Cambiar contraseña</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {success ? (
          <div>
            <p style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
              Contraseña actualizada. Úsala la próxima vez que inicies sesión.
            </p>
            <button type="button" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 10 caracteres"
                minLength={10}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={10}
                required
              />
            </div>
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordModal;
