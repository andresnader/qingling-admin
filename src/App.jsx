import { useState } from 'react';
import { login, logout, getUser, isAuthenticated } from './api';
import TrucksManager from './components/TrucksManager';
import PagesManager from './components/PagesManager';

function App() {
  const [user, setUser] = useState(() => isAuthenticated() ? getUser() : null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trucks');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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
            <h1>QINGLING</h1>
            <p>Panel de Administración</p>
          </div>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qingling.com"
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
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <h1>QINGLING</h1>
          <span className="admin-badge">Admin</span>
        </div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'trucks' ? 'active' : ''}`}
          onClick={() => setActiveTab('trucks')}
        >
          Camiones
        </button>
        <button
          className={`nav-btn ${activeTab === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          Contenido
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'trucks' && <TrucksManager />}
        {activeTab === 'pages' && <PagesManager />}
      </main>
    </div>
  );
}

export default App;
