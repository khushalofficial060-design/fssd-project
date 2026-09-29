import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, total, limit } = pagination;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginTop: '32px', padding: '16px 0' }}>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{startItem}</span> to{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{endItem}</span> of{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{total}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          id="pagination-prev-button"
          style={{ padding: '6px 10px' }}
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            id={`pagination-page-${pageNum}-button`}
            style={{ minWidth: '36px', padding: '6px 10px' }}
          >
            {pageNum}
          </button>
        ))}

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          id="pagination-next-button"
          style={{ padding: '6px 10px' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
