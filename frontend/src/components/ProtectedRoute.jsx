import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading EventHub...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div className="glass-card" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f43f5e' }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>403 - Access Forbidden</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            You do not have the required permissions (<strong>{role}</strong>) to access this administrative portal. Current role: <em>{user.role}</em>.
          </p>
          <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
            <ArrowLeft size={18} /> Return to Campus Events
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
