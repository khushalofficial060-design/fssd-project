import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';

export function EventCard({ event, onSelect }) {
  const isFull = event.registered_count >= event.capacity;
  const percentage = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));
  const isUserRegistered = !!event.user_registration_status;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        position: 'relative'
      }}
      onClick={() => onSelect(event)}
      id={`event-card-${event.id}`}
    >
      {/* Event Image */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden' }}>
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, transparent 60%)' }}></div>

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
          <span className={`category-badge badge-${event.category}`}>
            {event.category}
          </span>
        </div>

        {/* User Registered badge on image */}
        {isUserRegistered && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#10b981',
              color: 'white',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
            }}
          >
            <CheckCircle2 size={13} />
            <span>Registered</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          Organized by {event.organizer}
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', lineHeight: 1.35, color: 'var(--text-primary)' }}>
          {event.title}
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>

        {/* Meta Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', marginTop: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="#818cf8" />
            <span>{formatDate(event.date)} &bull; {event.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} color="#f472b6" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
            <span style={{ fontWeight: 600, color: isFull ? '#fb7185' : 'var(--text-primary)' }}>
              {isFull ? 'Full' : `${event.spots_left || (event.capacity - event.registered_count)} spots left`} ({event.registered_count || 0}/{event.capacity})
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${percentage >= 100 ? 'danger' : percentage > 80 ? 'warning' : ''}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`btn ${isUserRegistered ? 'btn-success' : isFull ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          style={{ width: '100%' }}
          id={`view-event-${event.id}-button`}
        >
          {isUserRegistered ? 'View Registration' : isFull ? 'Event Full (View Details)' : 'View & Register'}
        </button>
      </div>
    </div>
  );
}
