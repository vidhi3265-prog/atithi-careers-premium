import React from 'react';
import { CheckCircle2, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function ThankYou() {
  const { state } = useLocation();
  return (
    <main className="thank-page">
      <section className="thank-card">
        <div className="thank-icon"><CheckCircle2 size={44} /></div>
        <span className="section-kicker">APPLICATION RECEIVED</span>
        <h1>Thank you{state?.name ? `, ${state.name.split(' ')[0]}` : ''}.</h1>
        <p>Your application{state?.position ? ` for ${state.position}` : ''} has been sent to Atithi Pure Veg Calgary. The owner will contact you if your profile is selected.</p>
        <Link className="btn btn-dark" to="/"><Home size={18} /> Back to careers</Link>
      </section>
    </main>
  );
}
