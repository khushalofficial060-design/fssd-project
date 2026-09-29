import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className="glass-card" style={{ maxWidth: '480px', padding: '48px 36px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
          <Sparkles size={32} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', color: 'var(--primary)' }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
          The campus event or page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={18} /> Return to EventHub Home
        </Link>
      </div>
    </div>
  );
}
