import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { applicationId } = req.body || {};
    if (!applicationId) return res.status(400).json({ error: 'Application ID is required' });

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: app, error } = await supabase.from('applications').select('*').eq('id', applicationId).single();
    if (error || !app) return res.status(404).json({ error: 'Application not found' });

    if (!['citizen', 'pr'].includes(app.work_status)) {
      return res.status(200).json({ sent: false, reason: 'Not eligible for owner notification' });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL,
        to: [process.env.OWNER_EMAIL],
        subject: `New ${app.position} application — ${app.full_name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#173d31">
            <div style="background:#173d31;color:white;padding:22px 26px;border-radius:14px 14px 0 0">
              <h2 style="margin:0">New qualified application</h2>
              <p style="margin:7px 0 0;color:#e7d7a7">Atithi Pure Veg Calgary</p>
            </div>
            <div style="border:1px solid #e7e1d3;border-top:0;padding:26px;border-radius:0 0 14px 14px">
              <p><strong>Name:</strong> ${escapeHtml(app.full_name)}</p>
              <p><strong>Position:</strong> ${escapeHtml(app.position)}</p>
              <p><strong>Experience:</strong> ${app.experience_years} year(s)</p>
              <p><strong>Status:</strong> ${app.work_status === 'pr' ? 'Permanent Resident' : 'Canadian Citizen'}</p>
              <p><strong>Phone:</strong> ${escapeHtml(app.phone)}</p>
              <p><strong>Email:</strong> ${escapeHtml(app.email)}</p>
              <p style="margin-top:24px">Login to the owner dashboard to review the resume and update the application.</p>
            </div>
          </div>`,
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error('Resend error:', details);
      return res.status(502).json({ error: 'Email provider failed' });
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
