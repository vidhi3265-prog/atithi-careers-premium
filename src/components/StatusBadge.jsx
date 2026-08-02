import React from 'react';
export default function StatusBadge({ value }) {
  const normalized = (value || 'new').toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${normalized}`}>{value || 'New'}</span>;
}
