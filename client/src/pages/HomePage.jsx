import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '⚡',
    title: 'Instant Access',
    text: 'No registration required. Connect, pay, and browse in seconds.',
  },
  {
    icon: '💰',
    title: 'Affordable Pricing',
    text: 'Simple hourly pricing at just 10 KES per hour.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    text: 'M-Pesa payments via PayHero keep checkout fast and safe.',
  },
  {
    icon: '📱',
    title: 'Easy One-Click',
    text: 'Choose your hours, confirm payment, and start browsing.',
  },
  {
    icon: '⏰',
    title: 'Flexible Hours',
    text: 'Purchase 1 to 24 hours and extend when you need more.',
  },
  {
    icon: '🌍',
    title: 'Always Online',
    text: 'Reliable hotspot access for customers throughout the day.',
  },
];

const steps = [
  { number: '1', title: 'Connect', text: 'Join the StreetWifi network on your device.' },
  { number: '2', title: 'Select Hours', text: 'Choose the amount of time you need.' },
  { number: '3', title: 'Pay via M-Pesa', text: 'Approve the prompt on your phone.' },
  { number: '4', title: 'Enjoy Internet', text: 'Your session starts immediately.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const mac = new URLSearchParams(window.location.search).get('mac');
    if (mac) {
      window.location.href = `/portal.html?mac=${mac}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_35%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col px-4 py-20 text-center sm:py-24">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-4xl shadow-lg backdrop-blur-sm">
              📡
            </div>
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
            Smart public WiFi access
          </p>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            StreetWifi makes connection effortless
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Pay for reliable internet in seconds and get online without a complicated signup process.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => window.location.href = '/portal.html'}
              className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Access Portal
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-lg font-semibold text-white transition hover:bg-white/20"
            >
              Admin Access
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur">
              <p className="text-2xl font-bold">10 KES</p>
              <p className="text-sm text-blue-100">per hour</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur">
              <p className="text-2xl font-bold">1–24 hrs</p>
              <p className="text-sm text-blue-100">flexible access windows</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-blue-100">reliable hotspot service</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Why choose us</p>
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Built for quick, dependable WiFi access</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-blue-700">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">How it works</p>
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">A simple flow from connect to browse</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800">{step.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-center text-white shadow-xl sm:p-12">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Ready to get connected?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              Open the StreetWifi portal and start your session instantly with a quick M-Pesa payment.
            </p>
            <button
              onClick={() => window.location.href = '/portal.html'}
              className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Access Portal Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

