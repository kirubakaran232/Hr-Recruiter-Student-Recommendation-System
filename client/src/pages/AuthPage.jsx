import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, GraduationCap, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const roles = [
  {
    value: 'hr',
    label: 'HR',
    description: 'Create jobs and shortlist candidates.',
    icon: BriefcaseBusiness
  },
  {
    value: 'student',
    label: 'Student',
    description: 'Build a profile and track readiness.',
    icon: GraduationCap
  }
];

function getErrorMessage(error) {
  const code = error?.code || '';

  if (code.includes('email-already-in-use')) return 'This email is already registered.';
  if (code.includes('invalid-credential')) return 'Invalid email or password.';
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was closed before it finished.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google sign-in popup.';
  if (code.includes('weak-password')) return 'Use at least 6 characters for your password.';
  if (code.includes('network')) return 'Network error. Please try again.';

  return error?.response?.data?.message || 'Something went wrong. Please try again.';
}

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { continueWithGoogle, login, register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRole = useMemo(() => roles.find((role) => role.value === form.role), [form.role]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await register(form);
      } else {
        await login(form);
      }

      navigate('/dashboard');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await continueWithGoogle({ role: form.role });
      navigate('/dashboard');
    } catch (googleError) {
      setError(getErrorMessage(googleError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-glow-bg">
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        <div className="glow-orb orb-3" />
      </div>

      <section className="auth-card" aria-label={isSignup ? 'Create TalentOS account' : 'Login to TalentOS'}>
        <div className="brand-row">
          <div className="brand-badge">
            <Sparkles size={16} className="brand-icon-sparkle" />
            <span className="brand-name">TalentOS AI</span>
          </div>
          
          <div className="auth-mode-toggle">
            <Link to="/login" className={`toggle-tab ${!isSignup ? 'active' : ''}`}>Login</Link>
            <Link to="/signup" className={`toggle-tab ${isSignup ? 'active' : ''}`}>Sign Up</Link>
          </div>
        </div>

        <div className="auth-grid">
          <aside className="showcase-panel">
            <div className="showcase-header-tag">
              <Sparkles size={14} />
              <span>Next-Gen Talent Intelligence</span>
            </div>

            <div className="showcase-hero-content">
              <h2>Evaluate skills with explainable AI precision.</h2>
              <p>Multi-dimensional profile scoring across resume ATS pillars, GitHub commits, live portfolio responsiveness, and coding ratings.</p>
            </div>

            <div className="showcase-features-stack">
              <div className="feature-mini-pill">
                <span className="pill-dot green" />
                <span>Real-Time Cross-Module Sync</span>
              </div>
              <div className="feature-mini-pill">
                <span className="pill-dot amber" />
                <span>Explainable Talent Score Engine</span>
              </div>
              <div className="feature-mini-pill">
                <span className="pill-dot blue" />
                <span>Automated ATS Resume Pillar Audit</span>
              </div>
            </div>

            <div className="score-card">
              <div className="score-card-top">
                <span>Account Workspace</span>
                <span className="role-chip">{selectedRole?.label}</span>
              </div>
              <p className="score-card-desc">Hire & build with empirical capability proof.</p>
            </div>
          </aside>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <p className="eyebrow">{isSignup ? 'Get Started' : 'Welcome Back'}</p>
              <h1>{isSignup ? 'Create your profile' : 'Login to your account'}</h1>
              <p className="subcopy">
                {isSignup
                  ? 'Select your workspace role to unlock tailored AI analysis tools.'
                  : 'Enter your credentials to access your intelligence dashboard.'}
              </p>
            </div>

            <div className="role-grid" role="radiogroup" aria-label="Account role">
              {roles.map((role) => {
                const Icon = role.icon;
                const active = form.role === role.value;

                return (
                  <label className={`role-option ${active ? 'active' : ''}`} key={role.value}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={active}
                      onChange={handleChange}
                    />
                    <div className="role-icon-wrap">
                      <Icon size={18} />
                    </div>
                    <div className="role-text-wrap">
                      <strong>{role.label}</strong>
                      <small>{role.description}</small>
                    </div>
                  </label>
                );
              })}
            </div>

            {isSignup && (
              <label className="field">
                <span>Full Name</span>
                <div className="field-input-wrap">
                  <User size={18} className="field-icon" />
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span>Email Address</span>
              <div className="field-input-wrap">
                <Mail size={18} className="field-icon" />
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="field-input-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </label>

            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-loading-state">
                  <span className="btn-spinner" /> Processing...
                </span>
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Login to Workspace'
              )}
            </button>

            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button className="google-button" type="button" onClick={handleGoogleAuth} disabled={isSubmitting}>
              <svg className="google-svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Google
            </button>

            <p className="switch-copy">
              {isSignup ? 'Already registered?' : 'Don\'t have an account?'}{' '}
              <Link to={isSignup ? '/login' : '/signup'}>
                {isSignup ? 'Sign In' : 'Create Account'}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
