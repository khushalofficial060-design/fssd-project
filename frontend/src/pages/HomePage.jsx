import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Gaming', 'Entrepreneurship', 'Arts'];

export function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEvents({
        search,
        category: category === 'All' ? '' : category,
        dateFilter,
        page,
        limit: 9
      });
      if (res.success) {
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [search, category, dateFilter, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setDateFilter('all');
    setPage(1);
  };

  return (
    <div className="main-content">
      {/* Hero Banner */}
      <section
        className="glass-card"
        style={{
          padding: '48px 36px',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: 'var(--shadow-glow)'
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: '#a5b4fc', fontSize: '0.84rem', fontWeight: 700, marginBottom: '16px' }}>
            <Sparkles size={16} /> Campus Life &bull; Fall Semester 2026
          </div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Discover, Register & Experience <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>College Events</span>
          </h1>
          <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
            Join hackathons, cultural festivals, sports tournaments, masterclasses, and esports championships happening across campus.
          </p>

          {/* Search Bar in Hero */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '620px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search events by title, keyword, organizer, or venue..."
                className="form-input"
                style={{ paddingLeft: '44px', height: '48px', fontSize: '0.96rem', borderRadius: 'var(--radius-md)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="hero-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="hero-search-button" style={{ height: '48px', padding: '0 24px' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filter Controls Bar */}
      <section style={{ marginBottom: '28px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              id={`filter-category-${cat.toLowerCase()}`}
              style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date Filters & Result Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', background: 'var(--bg-card)', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={17} color="var(--primary)" />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Timeline:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: 'All Dates' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'today', label: 'Today' },
                { id: 'past', label: 'Past' }
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => handleDateFilterChange(df.id)}
                  className={`btn btn-sm ${dateFilter === df.id ? 'btn-outline' : 'btn-secondary'}`}
                  id={`filter-date-${df.id}`}
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {(search || category !== 'All' || dateFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              id="reset-filters-button"
              style={{ fontSize: '0.8rem', padding: '4px 10px', color: '#fb7185' }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Discovering campus events...</p>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#fb7185' }}>
            <p style={{ fontSize: '1.05rem', marginBottom: '16px' }}>{error}</p>
            <button onClick={fetchEvents} className="btn btn-secondary btn-sm">Try Again</button>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No events match your criteria</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
              Try searching with different keywords or reset your active filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              View All Events
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={(ev) => setSelectedEvent(ev)}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </section>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRefresh={fetchEvents}
        />
      )}
    </div>
  );
}
