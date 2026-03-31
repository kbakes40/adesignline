'use client';

import { useCallback, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactModalForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sentHint, setSentHint] = useState(false);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const next: typeof errors = {};
      if (!name.trim()) next.name = 'Please enter your name.';
      if (!email.trim()) next.email = 'Please enter your email.';
      else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.';
      if (!message.trim()) next.message = 'Please enter a message.';
      setErrors(next);
      if (Object.keys(next).length > 0) return;

      const subject = encodeURIComponent('Website contact from A Design Line');
      const body = encodeURIComponent(
        `Name: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim() || '—'}\n\n${message.trim()}`
      );
      window.location.href = `mailto:angie@adesignline.com?subject=${subject}&body=${body}`;
      setSentHint(true);
    },
    [name, email, phone, message]
  );

  return (
    <div className="mt-8 border-t border-neutral-200 pt-8">
      <h3 className="text-base font-semibold text-neutral-900">Send a message</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
        Opens your email app with your details filled in. You can edit before sending.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="footer-contact-name" className="block text-[12px] font-medium text-neutral-700">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="footer-contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30"
          />
          {errors.name ? <p className="mt-1 text-[12px] text-red-600">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="footer-contact-email" className="block text-[12px] font-medium text-neutral-700">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="footer-contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30"
          />
          {errors.email ? <p className="mt-1 text-[12px] text-red-600">{errors.email}</p> : null}
        </div>
        <div>
          <label htmlFor="footer-contact-phone" className="block text-[12px] font-medium text-neutral-700">
            Phone <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="footer-contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30"
          />
        </div>
        <div>
          <label htmlFor="footer-contact-message" className="block text-[12px] font-medium text-neutral-700">
            Message <span className="text-red-600">*</span>
          </label>
          <textarea
            id="footer-contact-message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1.5 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 shadow-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-400/30"
          />
          {errors.message ? <p className="mt-1 text-[12px] text-red-600">{errors.message}</p> : null}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          Open email to send
        </button>
        {sentHint ? (
          <p className="text-[13px] text-neutral-600">
            If your mail app did not open, email{' '}
            <a href="mailto:angie@adesignline.com" className="font-medium text-neutral-900 underline">
              angie@adesignline.com
            </a>{' '}
            directly.
          </p>
        ) : null}
      </form>
    </div>
  );
}
