import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://127.0.0.1:5000/api';

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isRegister) {
        setIsRegister(false);
        setError('Registration successful! Please login.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setIsRegister(false);
    setError('');
    // Automatically trigger form submit on next tick
    setTimeout(() => {
      document.getElementById('login-form-btn').click();
    }, 100);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span className="material-symbols-outlined" style={styles.logoIcon}>hub</span>
          <h2 style={styles.title}>Smart City Knowledge Portal</h2>
          <p style={styles.subtitle}>
            {isRegister ? 'Create an account to query regulations' : 'Sign in to access civic data and RAG pipelines'}
          </p>
        </div>

        {error && (
          <div style={error.includes('successful') ? styles.successBox : styles.errorBox}>
            <span className="material-symbols-outlined" style={styles.errorIcon}>
              {error.includes('successful') ? 'check_circle' : 'info'}
            </span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} style={styles.form}>
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputContainer}>
                <span className="material-symbols-outlined" style={styles.inputIcon}>person</span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputContainer}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>mail</span>
              <input
                type="email"
                placeholder="your.email@smartcity.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" id="login-form-btn" disabled={loading} style={styles.submitBtn} className="active-scale">
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div style={styles.toggleText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={styles.toggleBtn}>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Developer / Seed Roles</span>
        </div>

        <div style={styles.quickRoles}>
          <button
            onClick={() => triggerQuickLogin('admin@smartcity.gov', 'admin123')}
            style={{ ...styles.quickBtn, borderLeft: '4px solid var(--color-primary)' }}
            className="hover-lift active-scale"
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>admin_panel_settings</span>
            <div style={styles.quickBtnText}>
              <strong>Login as Admin</strong>
              <span>Upload and Manage Docs</span>
            </div>
          </button>

          <button
            onClick={() => triggerQuickLogin('citizen@smartcity.gov', 'citizen123')}
            style={{ ...styles.quickBtn, borderLeft: '4px solid var(--color-secondary)' }}
            className="hover-lift active-scale"
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>person</span>
            <div style={styles.quickBtnText}>
              <strong>Login as Citizen</strong>
              <span>Ask City & Waste Rules</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-background)',
    padding: 'var(--spacing-md)',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--rounded-xl)',
    border: '1px solid var(--color-outline-variant)',
    boxShadow: 'var(--shadow-lg)',
    padding: 'var(--spacing-lg)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'var(--spacing-md)',
  },
  logoIcon: {
    fontSize: '40px',
    color: 'var(--color-primary)',
    marginBottom: 'var(--spacing-xs)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--color-on-surface)',
    marginBottom: 'var(--spacing-base)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-base)',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface-container-low)',
    borderRadius: 'var(--rounded-md)',
    border: '1px solid var(--color-outline-variant)',
    padding: '0 var(--spacing-sm)',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    color: 'var(--color-on-surface-variant)',
    marginRight: 'var(--spacing-xs)',
    fontSize: '20px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '10px 0',
    color: 'var(--color-on-surface)',
    fontSize: '14px',
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--rounded-md)',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 'var(--spacing-base)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'opacity 0.2s',
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--color-on-surface-variant)',
    marginTop: 'var(--spacing-md)',
  },
  toggleBtn: {
    border: 'none',
    background: 'none',
    color: 'var(--color-primary)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-error-container)',
    color: 'var(--color-on-error-container)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--rounded-md)',
    fontSize: '14px',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline-variant)',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-on-secondary-container)',
    color: 'var(--color-secondary-container)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--rounded-md)',
    fontSize: '14px',
    marginBottom: 'var(--spacing-md)',
  },
  errorIcon: {
    fontSize: '20px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: 'var(--spacing-md) 0',
  },
  dividerText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-outline)',
    backgroundColor: 'var(--color-surface)',
    padding: '0 var(--spacing-xs)',
    margin: '0 auto',
    zIndex: 1,
  },
  quickRoles: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  quickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-surface-container-low)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-md)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  quickBtnIcon: {
    fontSize: '24px',
  },
  quickBtnText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
};
