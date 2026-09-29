import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyRegistrationsPage() {
  const { success, error } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMyRegistrations({
        status: statusFilter === 'All' ? '' : statusFilter,
        search,
        page,
        limit: 8
      });
      if (res.success) {
        setRegistrations(res.data.registrations);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch your registrations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, error]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleCancelRegistration = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${title}"?`)) {
      return;
    }

    setCancellingId(eventId);
    try {
      const res = await api.cancelRegistration(eventId);
      if (res.success) {
        success('Registration cancelled successfully.');
        fetchRegistrations();
      }
    } catch (err) {
      error(err.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Ticket size={22} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Event Registrations</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your booked college events, view ticket status, and cancel bookings if you cannot attend.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Registered', 'Attended', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
              id={`filter-reg-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search registered events..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="search-my-registrations"
          />
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '14px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your event bookings...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Ticket size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No registrations found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
            {statusFilter === 'All'
              ? "You haven't registered for any events yet. Explore upcoming campus events and join the action!"
              : `You don't have any registrations marked as '${statusFilter}'.`}
          </p>
          <Link to="/" className="btn btn-primary btn-sm" id="browse-events-cta-button">
            Browse Upcoming Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {registrations.map((reg) => (
            <div
              key={reg.registration_id}
              className="glass-card"
              id={`reg-card-${reg.registration_id}`}
              style={{
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '180px 1fr auto',
                gap: '24px',
                alignItems: 'center',
                borderLeft: reg.registration_status === 'Registered'
                  ? '4px solid #10b981'
                  : reg.registration_status === 'Attended'
                  ? '4px solid #3b82f6'
                  : '4px solid #f43f5e'
              }}
            >
              {/* Event Image */}
              <div style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={reg.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
                  alt={reg.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className={`category-badge badge-${reg.category}`}
                  style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.68rem', padding: '2px 8px' }}
                >
                  {reg.category}
                </span>
              </div>

              {/* Event Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className={`status-badge status-${reg.registration_status}`}>
                    {reg.registration_status === 'Registered' && <CheckCircle2 size={13} />}
                    {reg.registration_status === 'Attended' && <CheckCircle2 size={13} />}
                    {reg.registration_status === 'Cancelled' && <XCircle size={13} />}
                    <span>{reg.registration_status}</span>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Booked on {new Date(reg.registration_date).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {reg.title}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#818cf8" />
                    <span>{formatDate(reg.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#06b6d4" />
                    <span>{reg.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#ec4899" />
                    <span>{reg.venue}</span>
                  </div>
                </div>

                {reg.notes && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    <strong>Note:</strong> {reg.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                {reg.registration_status === 'Registered' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelRegistration(reg.event_id, reg.title)}
                    disabled={cancellingId === reg.event_id}
                    id={`cancel-reg-${reg.registration_id}-button`}
                  >
                    <XCircle size={14} />
                    <span>{cancellingId === reg.event_id ? 'Cancelling...' : 'Cancel Registration'}</span>
                  </button>
                )}
                {reg.registration_status === 'Cancelled' && (
                  <div style={{ fontSize: '0.82rem', color: '#fb7185', textAlign: 'center' }}>
                    Cancelled
                  </div>
                )}
                {reg.registration_status === 'Attended' && (
                  <div style={{ fontSize: '0.82rem', color: '#60a5fa', textAlign: 'center', fontWeight: 600 }}>
                    Attendance Verified
                  </div>
                )}
              </div>
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
