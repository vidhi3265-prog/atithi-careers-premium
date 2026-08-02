import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ compact = false }) {
  return (
    <header className={`site-header ${compact ? 'compact' : ''}`}>
      <Link to="/" className="brand" aria-label="Atithi Careers home">
        <span className="brand-mark">A</span>
        <span>
          <strong>ATITHI</strong>
          <small>PURE VEG • CALGARY</small>
        </span>
      </Link>
      <Link className="header-action" to="/apply">Apply Now</Link>
    </header>
  );
}
