import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  GraduationCap,
  Building,
  Phone,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology & AI',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical & Robotics Engineering',
  'Civil & Environmental Engineering',
  'Biotechnology & Bioinformatics',
  'School of Business Administration (BBA/MBA)',
  'Media, Arts & Visual Design',
  'Pure Sciences & Mathematics'
];

export function RegisterPage() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    student_id: '',
    department: 'Computer Science & Engineering',
    phone: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', class: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', class: 'weak' };
    if (score <= 3) return { score: 2, label: 'Medium', class: 'medium' };
    return { score: 3, label: 'Strong', class: 'strong' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuickFill = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: `Rahul Verma ${randomId % 100}`,
      email: `student.${randomId}@college.edu`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      student_id: `CS2026-${randomId}`,
      department: 'Computer Science & Engineering',
      phone: `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`,
      agreeTerms: true
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setFormError('Please agree to the Campus Event Code of Conduct');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, agreeTerms, ...payload } = formData;
      const user = await register(payload);
      success(`Registration complete! Welcome to EventHub, ${user.name}`);
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Registration failed');
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ maxWidth: '1080px' }}>
        {/* Left Side: Brand Showcase */}
        <div className="auth-showcase">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div className="nav-brand-icon">
                <Sparkles size={20} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>EventHub</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '5px 12px', borderRadius: 'var(--radius-full)', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px' }}>
              🎓 Verified Student Network
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '14px' }}>
              Join 1,200+ Students <br />
              <span style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                On Campus Today
              </span>
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
              Create your official student profile to register for workshops, hackathons, sports tournaments, and student club activities.
            </p>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon" style={{ color: '#818cf8' }}>
                <BookOpen size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Department Synchronization</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Get tailored event suggestions based on your field of study.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon" style={{ color: '#34d399' }}>
                <Zap size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>One-Click Event Booking</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Reserve limited seat tickets in under 2 seconds with instant confirmation.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon" style={{ color: '#f472b6' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Digital Attendance Log</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Download participation records for college credit & certificates.</p>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={handleQuickFill}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.82rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
              <Zap size={14} color="#818cf8" />
              <span>⚡ Fast-Fill Sample Student Details</span>
            </button>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="auth-form-card" style={{ padding: '34px 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>Create Student Profile</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Fill in your collegiate details to start participating.
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '5px 10px', flexShrink: 0 }}
              title="Auto-fill random test student data"
            >
              <Zap size={13} color="#818cf8" /> Auto Fill
            </button>
          </div>

          {formError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    id="reg-name"
                    name="name"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="reg-email">College Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="jane.doe@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="reg-student-id">Student ID / Roll No.</label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    id="reg-student-id"
                    name="student_id"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="CS2026-108"
                    value={formData.student_id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="reg-phone">Contact Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    id="reg-phone"
                    name="phone"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" htmlFor="reg-department">Department / Major</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  id="reg-department"
                  name="department"
                  className="form-select"
                  style={{ paddingLeft: '38px' }}
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} style={{ background: '#111827', color: '#fff' }}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" htmlFor="reg-password">Password (min 6)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    name="password"
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reg-confirm-password"
                    name="confirmPassword"
                    className="form-input"
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '38px',
                      borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? 'rgba(244, 63, 94, 0.6)' : undefined
                    }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Bar */}
            {formData.password && (
              <div className="password-strength-container">
                <div className="strength-bars">
                  <div className={`strength-segment ${strength.score >= 1 ? strength.class : ''}`} />
                  <div className={`strength-segment ${strength.score >= 2 ? strength.class : ''}`} />
                  <div className={`strength-segment ${strength.score >= 3 ? strength.class : ''}`} />
                </div>
                <div className="strength-label">
                  <span style={{ color: 'var(--text-muted)' }}>Strength: <span style={{ color: strength.class === 'strong' ? '#10b981' : strength.class === 'medium' ? '#f59e0b' : '#f43f5e', fontWeight: 700 }}>{strength.label}</span></span>
                  {formData.confirmPassword && (
                    <span style={{ color: formData.password === formData.confirmPassword ? '#10b981' : '#f43f5e' }}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{ margin: '14px 0 18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                I agree to the Campus Event Code of Conduct and Participation Rules
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '10px' }}
              disabled={loading}
              id="register-submit-button"
            >
              {loading ? (
                <span>Creating profile & signing in...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Complete Student Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have a collegiate account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }} id="link-to-login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
