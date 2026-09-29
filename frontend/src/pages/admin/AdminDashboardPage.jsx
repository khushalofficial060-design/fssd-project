import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  CalendarDays,
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function AdminDashboardPage() {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.getAdminStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        error(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [error]);

  if (loading) {
    return (
      <div className="main-content-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Admin Analytics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalEvents: 0,
    totalStudents: 0,
    totalRegistrations: 0,
    totalAttended: 0,
    upcomingEvents: 0
  };

  const categoryStats = data?.categoryStats || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="main-content-wide">
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <Sparkles size={16} /> Admin Command Center
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Events & Campus Overview</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/events" className="btn btn-primary" id="admin-create-event-cta">
            <PlusCircle size={18} />
            <span>Manage & Create Events</span>
          </Link>
          <Link to="/admin/participants" className="btn btn-secondary" id="admin-view-all-participants-cta">
            <Users size={18} />
            <span>All Participants</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL EVENTS</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalEvents}</div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '8px' }}>
            {stats.upcomingEvents} active / upcoming
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTERED STUDENTS</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Enrolled student accounts
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REGISTRATIONS</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
              <Ticket size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalRegistrations}</div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '8px' }}>
            Active event bookings
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONFIRMED ATTENDANCE</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalAttended}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Students checked-in
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }}>
        {/* Categories Breakdown */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <span>Events by Category</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryStats.map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                  <span className={`category-badge badge-${item.category}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {item.category}
                  </span>
                  <span style={{ fontWeight: 700 }}>{item.count} {item.count === 1 ? 'event' : 'events'}</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.totalEvents)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={18} color="#f472b6" />
              <span>Recent Registrations Feed</span>
            </h3>
            <Link to="/admin/participants" style={{ fontSize: '0.86rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No recent registrations recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.registration_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{reg.student_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{reg.student_id || reg.student_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{reg.event_title}</div>
                        <span className={`category-badge badge-${reg.event_category}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {reg.event_category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {new Date(reg.registration_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status-badge status-${reg.status}`} style={{ fontSize: '0.74rem' }}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
