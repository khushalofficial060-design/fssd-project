import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  CalendarDays,
  Ticket,
  Users,
  ArrowRight
} from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin' && from === '/') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
      error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      success(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err.message || 'Demo login failed');
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left Side: Brand Showcase */}
        <div className="auth-showcase">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div className="nav-brand-icon">
                <Sparkles size={20} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>EventHub</span>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '14px' }}>
              Your Gateway to <br />
              <span style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Campus Life & Tech Fests
              </span>
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '32px', lineHeight: 1.6 }}>
              Discover inter-college hackathons, cultural fests, sports championships, and workshops with 1-click registration.
            </p>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <CalendarDays size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Real-time Event Discovery</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Filter by Technical, Cultural, Gaming, and Workshops.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon" style={{ color: '#34d399' }}>
                <Ticket size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Instant Digital Passes</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Track your booking status and QR ticket verifications.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon" style={{ color: '#f472b6' }}>
                <Users size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Organizer Command Center</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Comprehensive attendee analytics and capacity controls.</p>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EventHub Collegiate Portal &copy; 2026</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399' }}>
              <CheckCircle2 size={14} /> System Operational
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-card">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Sign in to your account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Enter your credentials to access campus events and passes.
            </p>
          </div>

          {/* Quick Demo Login Grid */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                ⚡ Quick Demo Access (1-Click)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="demo-pill-btn admin"
                onClick={() => handleDemoLogin('admin@eventhub.com', 'admin123')}
                id="demo-admin-login-button"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#f472b6" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f472b6' }}>Admin Officer</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Full Dashboard Access</div>
                </div>
              </button>

              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleDemoLogin('aarav.sharma@college.edu', 'student123')}
                id="demo-student-login-button"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={16} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#a5b4fc' }}>Student Demo</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CS Dept Student</div>
                </div>
              </button>
            </div>
          </div>

          {formError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">College Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  id="login-email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                Remember me on this device
              </label>

              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', cursor: 'default' }}>
                Protected with JWT
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '10px' }}
              disabled={loading}
              id="login-submit-button"
            >
              {loading ? (
                <span>Authenticating with API...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            New student joining campus?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }} id="link-to-register">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
