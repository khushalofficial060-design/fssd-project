import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../../components/Pagination';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Calendar,
  GraduationCap,
  Building,
  ArrowLeft
} from 'lucide-react';

export function AdminParticipantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const urlEventId = searchParams.get('eventId') || 'All';

  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [eventsList, setEventsList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ all: 0, registered: 0, attended: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Load all events for selector
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.getEvents({ limit: 100 });
        if (res.success) {
          setEventsList(res.data.events);
        }
      } catch (err) {
        console.error('Failed to load events for filter:', err);
      }
    }
    loadEvents();
  }, []);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedEventId && selectedEventId !== 'All') {
        const res = await api.getEventParticipants(selectedEventId, {
          status: statusFilter === 'All' ? '' : statusFilter,
          search,
          page,
          limit: 10
        });
        if (res.success) {
          setParticipants(res.data.participants);
          setPagination(res.data.pagination);
          if (res.data.summary) setSummary(res.data.summary);
        }
      } else {
        const res = await api.getAllParticipants({
          status: statusFilter === 'All' ? '' : statusFilter,
          search,
          page,
          limit: 10
        });
        if (res.success) {
          setParticipants(res.data.participants);
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, statusFilter, search, page, error]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleEventChange = (newId) => {
    setSelectedEventId(newId);
    setPage(1);
    if (newId === 'All') {
      searchParams.delete('eventId');
    } else {
      searchParams.set('eventId', newId);
    }
    setSearchParams(searchParams);
  };

  const handleStatusChange = async (regId, newStatus, studentName) => {
    setUpdatingId(regId);
    try {
      const res = await api.updateRegistrationStatus(regId, newStatus);
      if (res.success) {
        success(`Status updated to "${newStatus}" for ${studentName}`);
        fetchParticipants();
      }
    } catch (err) {
      error(err.message || 'Failed to update participant status');
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedEventObj = eventsList.find(e => String(e.id) === String(selectedEventId));

  return (
    <div className="main-content-wide">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <Users size={16} /> Attendee Roster
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            {selectedEventObj ? `Participants: ${selectedEventObj.title}` : 'All Event Participants'}
          </h1>
        </div>

        {selectedEventId !== 'All' && (
          <button
            onClick={() => handleEventChange('All')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> Show All Events
          </button>
        )}
      </div>

      {/* Event Selector & Stats Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <label className="form-label" htmlFor="filter-by-event" style={{ marginBottom: '8px' }}>Select Event Filter:</label>
          <select
            id="filter-by-event"
            className="form-select"
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
          >
            <option value="All">All Campus Events (Global)</option>
            {eventsList.map(e => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.category}) - {new Date(e.date + 'T00:00:00').toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEventObj && (
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{summary.registered}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{summary.attended}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attended</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb7185' }}>{summary.cancelled}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cancelled</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedEventObj.capacity}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacity</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Registered', 'Attended', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              id={`participant-filter-${status.toLowerCase()}`}
              style={{ fontSize: '0.82rem' }}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search student name, email, department..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="search-participants-input"
          />
        </div>
      </div>

      {/* Participants Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Retrieving attendee roster...</p>
        </div>
      ) : participants.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No participants found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            No attendee records matched your search/status filter.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Student ID & Dept</th>
                  {selectedEventId === 'All' && <th>Event</th>}
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.registration_id} id={`participant-row-${p.registration_id}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.student_name)}&background=6366f1&color=fff`}
                          alt={p.student_name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.student_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.student_email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.86rem' }}>{p.student_id || 'N/A'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.department || 'General'}</div>
                    </td>
                    {selectedEventId === 'All' && (
                      <td style={{ maxWidth: '220px' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.event_title}</div>
                        <span className={`category-badge badge-${p.event_category}`} style={{ fontSize: '0.64rem', padding: '1px 6px' }}>
                          {p.event_category}
                        </span>
                      </td>
                    )}
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      {new Date(p.registration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`status-badge status-${p.registration_status}`}>
                        {p.registration_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {p.registration_status !== 'Attended' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(p.registration_id, 'Attended', p.student_name)}
                            disabled={updatingId === p.registration_id}
                            title="Mark as Attended"
                            id={`mark-attended-${p.registration_id}`}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Attended</span>
                          </button>
                        )}
                        {p.registration_status !== 'Registered' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(p.registration_id, 'Registered', p.student_name)}
                            disabled={updatingId === p.registration_id}
                            title="Reset to Registered"
                            id={`mark-registered-${p.registration_id}`}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            <Clock size={13} />
                            <span>Registered</span>
                          </button>
                        )}
                        {p.registration_status !== 'Cancelled' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusChange(p.registration_id, 'Cancelled', p.student_name)}
                            disabled={updatingId === p.registration_id}
                            title="Mark as Cancelled"
                            id={`mark-cancelled-${p.registration_id}`}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '0 20px 16px' }}>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
