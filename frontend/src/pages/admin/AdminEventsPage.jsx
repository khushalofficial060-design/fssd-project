import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../../components/Pagination';
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  X,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building
} from 'lucide-react';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Gaming', 'Entrepreneurship', 'Arts'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const EMPTY_EVENT_FORM = {
  title: '',
  description: '',
  category: 'Technical',
  date: new Date().toISOString().split('T')[0],
  time: '10:00 AM',
  venue: '',
  capacity: 100,
  organizer: '',
  image_url: '',
  status: 'Upcoming'
};

export function AdminEventsPage() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EVENT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({
        search,
        category: category === 'All' ? '' : category,
        page,
        limit: 10
      });
      if (res.success) {
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [search, category, page, error]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData(EMPTY_EVENT_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date ? event.date.split('T')[0] : '',
      time: event.time,
      venue: event.venue,
      capacity: event.capacity,
      organizer: event.organizer,
      image_url: event.image_url || '',
      status: event.status || 'Upcoming'
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent) {
        const res = await api.updateEvent(editingEvent.id, formData);
        if (res.success) {
          success(`Event "${formData.title}" updated successfully!`);
          setIsModalOpen(false);
          fetchEvents();
        }
      } else {
        const res = await api.createEvent(formData);
        if (res.success) {
          success(`Event "${formData.title}" created successfully!`);
          setIsModalOpen(false);
          fetchEvents();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All associated registrations will also be removed.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.deleteEvent(id);
      if (res.success) {
        success(`Event "${title}" has been deleted.`);
        fetchEvents();
      }
    } catch (err) {
      error(err.message || 'Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="main-content-wide">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <CalendarDays size={16} /> Event Management
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Manage Campus Events</h1>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreateModal} id="admin-add-new-event-button">
          <Plus size={18} />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by title, venue, organizer..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="admin-search-events"
          />
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading event repository...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <CalendarDays size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No events found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            No events match your current filter criteria.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
            Create New Event
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event Info</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Capacity / Registered</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} id={`admin-event-row-${event.id}`}>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{event.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {event.organizer}</div>
                    </td>
                    <td>
                      <span className={`category-badge badge-${event.category}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {event.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      <div>{new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{event.time}</div>
                    </td>
                    <td style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.venue}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {event.registered_count || 0} / {event.capacity}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: (event.registered_count >= event.capacity) ? '#fb7185' : '#34d399' }}>
                        {event.registered_count >= event.capacity ? 'Full' : `${event.capacity - (event.registered_count || 0)} spots left`}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${event.status === 'Upcoming' ? 'Registered' : event.status === 'Ongoing' ? 'Attended' : 'Cancelled'}`} style={{ fontSize: '0.75rem' }}>
                        {event.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Link
                          to={`/admin/participants?eventId=${event.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Registered Participants"
                          id={`view-participants-event-${event.id}`}
                          style={{ padding: '6px 8px' }}
                        >
                          <Users size={14} color="#818cf8" />
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(event)}
                          title="Edit Event"
                          id={`edit-event-${event.id}`}
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit2 size={14} color="#38bdf8" />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={deletingId === event.id}
                          title="Delete Event"
                          id={`delete-event-${event.id}`}
                          style={{ padding: '6px 8px' }}
                        >
                          <Trash2 size={14} />
                        </button>
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Create New Campus Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="event-title">Event Title *</label>
                  <input
                    type="text"
                    id="event-title"
                    name="title"
                    className="form-input"
                    placeholder="e.g. HackForge 2026: 36-Hour Hackathon"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-category">Category *</label>
                    <select
                      id="event-category"
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-organizer">Organizer / Society *</label>
                    <input
                      type="text"
                      id="event-organizer"
                      name="organizer"
                      className="form-input"
                      placeholder="e.g. ACM Student Chapter"
                      value={formData.organizer}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-date">Date *</label>
                    <input
                      type="date"
                      id="event-date"
                      name="date"
                      className="form-input"
                      value={formData.date}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-time">Time *</label>
                    <input
                      type="text"
                      id="event-time"
                      name="time"
                      className="form-input"
                      placeholder="e.g. 09:00 AM"
                      value={formData.time}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-capacity">Capacity *</label>
                    <input
                      type="number"
                      id="event-capacity"
                      name="capacity"
                      className="form-input"
                      min="1"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-venue">Venue / Location *</label>
                    <input
                      type="text"
                      id="event-venue"
                      name="venue"
                      className="form-input"
                      placeholder="e.g. Main Auditorium & CS Labs"
                      value={formData.venue}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="event-status">Event Status</label>
                    <select
                      id="event-status"
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="event-image">Image URL (Optional)</label>
                  <input
                    type="url"
                    id="event-image"
                    name="image_url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="event-desc">Description *</label>
                  <textarea
                    id="event-desc"
                    name="description"
                    className="form-textarea"
                    placeholder="Describe the event, rules, schedule, and perks..."
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-event-submit-button">
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
