import React from 'react';
import { MapPin, Clock3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobCard({ title, description }) {
  return (
    <article className="job-card">
      <div className="job-icon">✦</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="job-meta"><MapPin size={16} /> 5471 Falsbridge Dr NE, Calgary, AB T3J 3E8, Canada</div>
      <Link to={`/apply?position=${encodeURIComponent(title)}`}>
        Apply for this role <ArrowRight size={17} />
      </Link>
    </article>
  );
}
