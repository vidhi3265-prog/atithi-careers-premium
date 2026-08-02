import React from 'react';
import { ArrowRight, BadgeCheck, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import JobCard from '../components/JobCard';
import poster from '../assets/hiring-poster.jpg';

const jobs = [
  ['Restaurant Manager', 'Lead daily operations and deliver an excellent guest experience.'],
  ['F&B Controller', 'Support inventory, cost control, purchasing and reporting.'],
  ['Restaurant Supervisor', 'Guide the floor team and keep service smooth and welcoming.'],
  ['Server', 'Create a warm dining experience with attentive service.'],
  ['Bartender', 'Prepare beverages and provide friendly, professional service.'],
  ['Chef / Cook', 'Prepare consistent, high-quality vegetarian dishes.'],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Header />
        <div className="hero-content">
          <span className="eyebrow">WE ARE HIRING IN CALGARY</span>
          <h1>Bring your talent.<br />Grow with <em>Atithi.</em></h1>
          <p>Join a team built on hospitality, quality and the joy of serving authentic vegetarian food.</p>
          <div className="hero-actions">
            <Link className="btn btn-gold" to="/apply">Start Application <ArrowRight size={19} /></Link>
            <a className="btn btn-ghost" href="#openings">View Openings</a>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={18} /> Secure application</span>
            <span><FileText size={18} /> Resume required</span>
            <span><BadgeCheck size={18} /> Citizen & PR only</span>
          </div>
        </div>
        <div className="hero-poster-wrap">
          <img src={poster} alt="Atithi Pure Veg Calgary hiring poster" className="hero-poster" />
        </div>
      </section>

      <section className="section intro-section">
        <span className="section-kicker">YOUR NEXT OPPORTUNITY</span>
        <h2>Open positions</h2>
        <p className="section-lead">Choose the role that fits your experience and complete a simple application in a few minutes.</p>
      </section>

      <section id="openings" className="section jobs-grid">
        {jobs.map(([title, description]) => <JobCard key={title} title={title} description={description} />)}
      </section>

      <section className="section eligibility-card">
        <div>
          <span className="section-kicker">BEFORE YOU APPLY</span>
          <h2>Simple eligibility</h2>
          <p>Applications are accepted from Canadian Citizens and Permanent Residents. A Canadian phone number and resume are required.</p>
        </div>
        <Link className="btn btn-dark" to="/apply">Apply now <ArrowRight size={19} /></Link>
      </section>

      <footer className="footer">© 2026 Atithi Pure Veg Calgary • Careers Portal</footer>
    </main>
  );
}
