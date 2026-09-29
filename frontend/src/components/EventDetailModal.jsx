import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Send,
  Ticket,
  ExternalLink
} from 'lucide-react';

export function EventDetailModal({ event, onClose, onRefresh }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!event) return null;

  const isFull = (event.registered_count || 0) >= event.capacity;
  const isUserRegistered = !!event.user_registration_status;
  const percentage = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerForEvent(event.id, notes);
      if (res.success) {
        success(res.message || 'Successfully registered for event!');
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${event.title}"?`)) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.cancelRegistration(event.id);
      if (res.success) {
        success('Registration cancelled successfully.');
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="event-detail-modal">
      <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
        {/* Header with image */}
        <div style={{ position: 'relative', width: '100%', height: '240px' }}>
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #111827 0%, rgba(17, 24, 39, 0.4) 100%)' }}></div>

          <button
            onClick={onClose}
            id="close-modal-button"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0, 0, 0, 0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={20} />
          </button>

          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
            <span className={`category-badge badge-${event.category}`}>
              {event.category}
            </span>
            {isUserRegistered && (
              <span className="status-badge status-Registered" style={{ fontSize: '0.84rem', padding: '5px 12px' }}>
                <CheckCircle2 size={15} /> You Are Registered
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {event.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            <Building size={16} color="#818cf8" />
            <span>Organized by <strong style={{ color: 'var(--text-secondary)' }}>{event.organizer}</strong></span>
          </div>

          {/* Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Calendar size={16} /> Date
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                {formatDate(event.date)}
              </div>
            </div>

            <div style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Clock size={16} /> Time
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                {event.time}
              </div>
            </div>

            <div style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                <MapPin size={16} /> Venue
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.venue}
              </div>
            </div>
          </div>

          {/* Capacity Progress Box */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Users size={16} />
                <span>Total Capacity</span>
              </div>
              <div style={{ fontWeight: 700, color: isFull ? '#fb7185' : '#34d399', fontSize: '0.92rem' }}>
                {event.registered_count || 0} / {event.capacity} Registered ({isFull ? 'FULL' : `${event.capacity - (event.registered_count || 0)} spots left`})
              </div>
            </div>
            <div className="progress-bar-bg" style={{ height: '9px' }}>
              <div
                className={`progress-bar-fill ${percentage >= 100 ? 'danger' : percentage > 80 ? 'warning' : ''}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Event Description */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '10px', color: 'var(--text-primary)' }}>About This Event</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </div>

          {/* Action / Registration Area */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            {!isAuthenticated ? (
              <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>Want to attend this event?</div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Log in with your student account to reserve your ticket.</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { onClose(); navigate('/login'); }}
                  id="modal-login-prompt-button"
                >
                  Log In to Register
                </button>
              </div>
            ) : isUserRegistered ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Ticket size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.98rem' }}>You're registered for this event!</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Your spot is reserved. View this anytime in My Registrations.</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleCancelRegistration}
                    disabled={cancelling}
                    id="modal-cancel-reg-button"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              </div>
            ) : isFull ? (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={22} color="#f43f5e" />
                <div>
                  <div style={{ fontWeight: 700, color: '#fb7185' }}>Registration Closed</div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>All {event.capacity} seats for this event are fully booked.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="reg-notes">
                    Registration Note or Dietary/Special Requirements (Optional):
                  </label>
                  <input
                    type="text"
                    id="reg-notes"
                    className="form-input"
                    placeholder="e.g. Team leader name, vegetarian food preference, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose} id="modal-close-action-button">
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    id="modal-confirm-register-button"
                  >
                    <Send size={16} />
                    <span>{loading ? 'Processing...' : 'Confirm Registration'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Admin Shortcuts */}
            {isAdmin && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Admin Tools:</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    navigate(`/admin/participants?eventId=${event.id}`);
                  }}
                  id="modal-admin-view-participants-button"
                >
                  <Users size={14} />
                  <span>View Event Participants</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
