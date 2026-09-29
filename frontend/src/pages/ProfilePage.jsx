import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  Ticket
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    student_id: user?.student_id || '',
    department: user?.department || '',
    phone: user?.phone || ''
  });

  const [totalRegs, setTotalRegs] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getProfile();
        if (res.success && res.data) {
          setTotalRegs(res.data.totalRegistrations || 0);
          if (res.data.user) {
            setFormData({
              name: res.data.user.name || '',
              student_id: res.data.user.student_id || '',
              department: res.data.user.department || '',
              phone: res.data.user.phone || ''
            });
          }
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    }
    loadStats();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.data.user) {
        updateUser(res.data.user);
        success('Your profile has been updated successfully!');
      }
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>Student Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and academic credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }}>
        {/* Left Column - Profile Card */}
        <div className="glass-card" style={{ padding: '28px', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 18px' }}>
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
              alt={user?.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
            />
          </div>

          <h2 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '14px' }}>{user?.email}</p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <span className={`role-badge ${user?.role}`} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
              <Shield size={12} /> {user?.role?.toUpperCase()}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{totalRegs}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Events
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>Active</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Edit Profile Details
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  id="profile-name"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address (Read-only)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  id="profile-email"
                  className="form-input"
                  style={{ paddingLeft: '40px', opacity: 0.6, cursor: 'not-allowed' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-student-id">Student ID / Roll No</label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    id="profile-student-id"
                    name="student_id"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="e.g. CS2023-042"
                    value={formData.student_id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-department">Academic Department</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    id="profile-department"
                    name="department"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Contact Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  id="profile-phone"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="+1-555-0100"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                id="save-profile-button"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
