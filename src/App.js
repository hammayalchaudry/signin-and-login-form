import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => { 
          setView('login'); 
          setMessage('');
          setFormData({ name: '', email: '', password: '' });
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to reach the backend server.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setView('dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Unable to reach the backend server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.cardContainer}>
        
        {/* Header / Tabs */}
        {view !== 'dashboard' ? (
          <div style={styles.tabContainer}>
            <button 
              onClick={() => { setView('login'); setError(''); setMessage(''); }} 
              style={view === 'login' ? styles.activeTab : styles.inactiveTab}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setView('signup'); setError(''); setMessage(''); }} 
              style={view === 'signup' ? styles.activeTab : styles.inactiveTab}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div style={styles.dashboardBadge}>
            <span style={styles.pulseDot}></span> Protected Session Active
          </div>
        )}

        {/* Dynamic Alerts */}
        {message && <div style={styles.successAlert}>{message}</div>}
        {error && <div style={styles.errorAlert}>{error}</div>}

        {/* SIGN UP FORM */}
        {view === 'signup' && (
          <form onSubmit={handleSignup} style={styles.form}>
            <h2 style={styles.heading}>Create Account</h2>
            <p style={styles.subHeading}>Sign up to access your dashboard</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="name@company.com" 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            <button type="submit" style={styles.primaryButton}>Register Now</button>
          </form>
        )}

        {/* LOG IN FORM */}
        {view === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <h2 style={styles.heading}>Welcome Back</h2>
            <p style={styles.subHeading}>Please enter your details to sign in</p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="name@company.com" 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            <button type="submit" style={styles.primaryButton}>Sign In</button>
          </form>
        )}

        {/* PROTECTED DASHBOARD */}
        {view === 'dashboard' && user && (
          <div style={styles.dashboardBody}>
            <div style={styles.avatarCircle}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ ...styles.heading, marginTop: '10px' }}>{user.name}</h2>
            <p style={styles.userEmail}>{user.email}</p>
            
            <div style={styles.infoCard}>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                🔒 <strong>Security Status:</strong> Authenticated via JWT. Unauthenticated requests are blocked.
              </p>
            </div>

            <button onClick={handleLogout} style={styles.logoutButton}>
              Log Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Inline CSS Styles for Modern Dashboard Look
const styles = {
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    padding: '32px',
    boxSizing: 'border-box',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '24px',
  },
  activeTab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  inactiveTab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
  },
  heading: {
    margin: '0 0 6px 0',
    fontSize: '22px',
    color: '#0f172a',
    fontWeight: '700',
    textAlign: 'center',
  },
  subHeading: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '16px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  primaryButton: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successAlert: {
    padding: '10px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorAlert: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
  },
  dashboardBody: {
    textAlign: 'center',
  },
  dashboardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    marginRight: '8px',
  },
  avatarCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
  },
  userEmail: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 20px 0',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default App;
