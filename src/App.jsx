/*
  THESIS: un CMS interno que se lee como parte del mismo estudio que el sitio
    público de QINGLING, no un admin genérico pegado al lado.
  OWN-WORLD: heredado de qingling-web — rojo #e31e24 como único acento sobre
    ink/blanco, Montserrat (headings) + Outfit (texto), radios ~10-14px,
    foco/selección en rojo. "Operate" en modo claro: sesión de escritorio,
    no la escena nocturna del sitio público.
  STORY: Andrés entra, reconoce la marca de inmediato (logo real, no texto),
    encuentra Multimedia como una sección más — y sube un archivo en dos clics
    en vez de pegar una URL a mano.
  FIRST VIEWPORT: login — fondo oscuro con un halo rojo sutil, tarjeta blanca
    centrada con el isotipo QINGLING arriba y CORASA al pie, botón rojo.
  FORM: expansión de un mundo visual ya establecido (impeccable new-work §1,
    "incomplete brand"), no creación de uno nuevo — construido directo en
    código (sin generación de imagen disponible en esta sesión: Stitch sin
    autenticar, se usó ui-ux-pro-max para los patrones de Operate/dashboard).
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
    finish review, the verdict, DESIGN.md, and every shipping raster carrying
    its provenance.
*/
import { useState } from 'react';
import { login, logout, getUser, isAuthenticated } from './api';
import TrucksManager from './components/TrucksManager';
import PagesManager from './components/PagesManager';
import SiteConfigManager from './components/SiteConfigManager';
import MediaManager from './components/MediaManager';
import ChangePasswordModal from './components/ChangePasswordModal';
import { Truck, FileText, Settings, KeyRound, Images } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => isAuthenticated() ? getUser() : null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trucks');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(
        typeof apiError === 'string'
          ? apiError
          : apiError?.message || 'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo-qingling.png" alt="QINGLING" className="login-logo" />
            <h1>Panel de administración</h1>
            <p>Entrá con tu cuenta de CORASA</p>
          </div>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@corasa.com"
                  autoComplete="username"
                  required
                />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
          <div className="login-footer">
            <img src="/logo-corasa.png" alt="CORASA" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <img src="/logo-qingling.png" alt="QINGLING" className="header-logo" />
          <span className="header-logo-divider" />
          <img src="/logo-corasa.png" alt="CORASA" className="header-logo header-logo-corasa" />
          <span className="admin-badge">Admin</span>
        </div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button
            onClick={() => setShowChangePassword(true)}
            className="logout-btn"
            title="Cambiar contraseña"
          >
            <KeyRound size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Contraseña
          </button>
          <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
        </div>
      </header>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      <nav className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'trucks' ? 'active' : ''}`}
          onClick={() => setActiveTab('trucks')}
        >
          <Truck size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Camiones
        </button>
        <button
          className={`nav-btn ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Contenido
        </button>
        <button
          className={`nav-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <Images size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Multimedia
        </button>
        <button
          className={`nav-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Configuración
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'trucks' && <TrucksManager />}
        {activeTab === 'pages' && <PagesManager />}
        {activeTab === 'media' && <MediaManager />}
        {activeTab === 'config' && <SiteConfigManager />}
      </main>
    </div>
  );
}

export default App;
