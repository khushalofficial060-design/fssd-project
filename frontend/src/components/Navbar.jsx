import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Calendar,
  Ticket,
  LayoutDashboard,
  CalendarDays,
  Users,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success('You have been logged out safely.');
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Sparkles size={20} />
          </div>
          <span>EventHub</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-events-link"
          >
            <Calendar size={18} />
            <span>Events</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-registrations"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-my-registrations-link"
            >
              <Ticket size={18} />
              <span>My Registrations</span>
            </NavLink>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-admin-dashboard-link"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/events"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-admin-events-link"
              >
                <CalendarDays size={18} />
                <span>Manage Events</span>
              </NavLink>

              <NavLink
                to="/admin/participants"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                id="nav-admin-participants-link"
              >
                <Users size={18} />
                <span>Participants</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Auth Action Menu */}
        <div className="nav-user-menu">
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="user-pill"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="user-profile-menu-button"
                style={{ cursor: 'pointer', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
                  alt={user?.name}
                  className="user-avatar"
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</span>
                  <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {dropdownOpen && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '220px',
                    padding: '8px',
                    zIndex: 200,
                    borderRadius: 'var(--radius-md)',
                    background: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    className="nav-link"
                    style={{ padding: '8px 12px' }}
                    onClick={() => setDropdownOpen(false)}
                    id="nav-dropdown-profile-link"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    id="nav-logout-button"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#fb7185',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-button">
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-button">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
