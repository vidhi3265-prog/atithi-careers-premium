import React from 'react';

import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  FileUp,
  LoaderCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';

import Header from '../components/Header';
import { supabase } from '../lib/supabase';

const positions = [
  'Restaurant Manager',
  'F&B Controller',
  'Restaurant Supervisor',
  'Server',
  'Bartender',
  'Chef / Cook',
];

const initial = {
  full_name: '',
  email: '',
  phone: '',
  city: 'Calgary',
  work_status: '',
  position: '',
  experience_years: '',
  available_from: '',
  message: '',
};

function normalizeCanadianPhone(value) {
  const digits = value
    .replace(/\D/g, '')
    .replace(/^1/, '')
    .slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Apply() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    ...initial,
    position: params.get('position') || '',
  });

  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const eligible = useMemo(
    () => ['citizen', 'pr'].includes(form.work_status),
    [form.work_status],
  );

  const update = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'phone'
          ? normalizeCanadianPhone(value)
          : value,
    }));

    setError('');
  };

  const handleResumeChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setResume(selectedFile);
    setError('');
  };

  const validate = () => {
    const phoneDigits = form.phone.replace(/\D/g, '');

    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.position ||
      !form.work_status ||
      form.experience_years === ''
    ) {
      return 'Please complete all required fields.';
    }

    if (phoneDigits.length !== 10) {
      return 'Please enter a valid 10-digit Canadian phone number.';
    }

    if (!eligible) {
      return 'Only Canadian Citizens and Permanent Residents can submit this application.';
    }

    if (!resume) {
      return 'Please upload your resume.';
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(resume.type)) {
      return 'Resume must be PDF, DOC or DOCX.';
    }

    if (resume.size > 5 * 1024 * 1024) {
      return 'Resume must be smaller than 5 MB.';
    }

    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const safeName = resume.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '-',
      );

      const uploadedPath = `${crypto.randomUUID()}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(uploadedPath, resume, {
          upsert: false,
          contentType: resume.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: `+1 ${form.phone}`,
        city: form.city.trim(),
        work_status: form.work_status,
        position: form.position,
        experience_years: Number(form.experience_years),
        available_from: form.available_from || null,
        message: form.message.trim() || null,
        resume_path: uploadedPath,
        status: 'New',
      };

      const { error: insertError } = await supabase
        .from('applications')
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      navigate('/thank-you', {
        replace: true,
        state: {
          name: form.full_name.trim(),
          position: form.position,
        },
      });
    } catch (submissionError) {
      console.error(submissionError);

      setError(
        submissionError.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileRef.current?.click();
    }
  };

  return (
    <main className="apply-page">
      <Header compact />

      <section className="apply-shell">
        <aside className="apply-side">
          <span className="eyebrow">ATITHI CAREERS</span>

          <h1>Apply in a few simple steps.</h1>

          <p>
            Your information and resume are securely submitted to the
            owner for review.
          </p>

          <div className="side-points">
            <span>
              <ShieldCheck />
              Private resume storage
            </span>

            <span>
              <Phone />
              Canadian phone required
            </span>

            <span>
              <CheckCircle2 />
              Citizens &amp; PR only
            </span>
          </div>
        </aside>

        <form
          className="application-form"
          onSubmit={submit}
        >
          <div className="form-heading">
            <span>JOB APPLICATION</span>
            <h2>Tell us about yourself</h2>
            <p>Fields marked * are required.</p>
          </div>

          {error && (
            <div
              className="form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="form-grid">
            <label className="field full">
              <span>Full name *</span>

              <input
                name="full_name"
                value={form.full_name}
                onChange={update}
                placeholder="Your full name"
                autoComplete="name"
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span>Email address *</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder="name@email.com"
                autoComplete="email"
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span>Canadian phone number *</span>

              <div className="phone-input">
                <b>+1</b>

                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={update}
                  placeholder="(403) 555-1234"
                  autoComplete="tel"
                  disabled={submitting}
                />
              </div>
            </label>

            <label className="field">
              <span>Current city *</span>

              <input
                name="city"
                value={form.city}
                onChange={update}
                placeholder="Calgary"
                autoComplete="address-level2"
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span>Position *</span>

              <select
                name="position"
                value={form.position}
                onChange={update}
                disabled={submitting}
              >
                <option value="">Select position</option>

                {positions.map((position) => (
                  <option
                    key={position}
                    value={position}
                  >
                    {position}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Years of experience *</span>

              <input
                type="number"
                min="0"
                max="50"
                name="experience_years"
                value={form.experience_years}
                onChange={update}
                placeholder="e.g. 3"
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span>Available start date</span>

              <input
                type="date"
                name="available_from"
                value={form.available_from}
                onChange={update}
                disabled={submitting}
              />
            </label>
          </div>

          <fieldset className="status-options">
            <legend>Work status in Canada *</legend>

            <label
              className={
                form.work_status === 'citizen'
                  ? 'selected'
                  : ''
              }
            >
              <input
                type="radio"
                name="work_status"
                value="citizen"
                checked={form.work_status === 'citizen'}
                onChange={update}
                disabled={submitting}
              />

              <span>
                <strong>Canadian Citizen</strong>
                <small>Eligible to submit</small>
              </span>
            </label>

            <label
              className={
                form.work_status === 'pr'
                  ? 'selected'
                  : ''
              }
            >
              <input
                type="radio"
                name="work_status"
                value="pr"
                checked={form.work_status === 'pr'}
                onChange={update}
                disabled={submitting}
              />

              <span>
                <strong>Permanent Resident (PR)</strong>
                <small>Eligible to submit</small>
              </span>
            </label>

            <label
              className={
                form.work_status === 'other'
                  ? 'blocked'
                  : ''
              }
            >
              <input
                type="radio"
                name="work_status"
                value="other"
                checked={form.work_status === 'other'}
                onChange={update}
                disabled={submitting}
              />

              <span>
                <strong>Other status</strong>
                <small>Not eligible for this opening</small>
              </span>
            </label>
          </fieldset>

          {form.work_status === 'other' && (
            <div className="eligibility-warning">
              This hiring campaign currently accepts only Canadian
              Citizens and Permanent Residents.
            </div>
          )}

          <label className="field full">
            <span>Short message (optional)</span>

            <textarea
              name="message"
              value={form.message}
              onChange={update}
              rows="4"
              placeholder="Tell us briefly about your experience or availability."
              disabled={submitting}
            />
          </label>

          <div
            className={`upload-box ${
              resume ? 'has-file' : ''
            }`}
            onClick={() => fileRef.current?.click()}
            onKeyDown={handleUploadKeyDown}
            role="button"
            tabIndex="0"
          >
            <FileUp size={28} />

            <div>
              <strong>
                {resume
                  ? resume.name
                  : 'Upload your resume *'}
              </strong>

              <small>
                {resume
                  ? `${(
                      resume.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB`
                  : 'PDF, DOC or DOCX • Maximum 5 MB'}
              </small>
            </div>

            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              disabled={submitting}
            />
          </div>

          <label className="consent">
            <input
              required
              type="checkbox"
              disabled={submitting}
            />

            <span>
              I confirm that the information provided is correct and I
              agree that Atithi may contact me about this application.
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-dark submit-btn"
            disabled={
              submitting ||
              form.work_status === 'other'
            }
          >
            {submitting ? (
              <>
                <LoaderCircle
                  className="spin"
                  size={19}
                />
                Submitting…
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </section>
    </main>
  );
}