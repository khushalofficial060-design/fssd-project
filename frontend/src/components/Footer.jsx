import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 20px', background: 'rgba(11, 15, 25, 0.95)', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={14} />
          </div>
          <span>EventHub &bull; Collegiate Event Management</span>
        </div>

        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} EventHub System. Normalized MySQL + Node.js + React.
        </div>
      </div>
    </footer>
  );
}
