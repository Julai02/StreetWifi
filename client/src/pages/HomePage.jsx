import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to portal after 3 seconds
    const timer = setTimeout(() => {
      const mac = new URLSearchParams(window.location.search).get('mac');
      if (mac) {
        window.location.href = `/portal.html?mac=${mac}`;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-red to-dark-red text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="inline-block bg-white text-primary-red font-bold px-6 py-4 rounded-full text-4xl">
              📡
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">StreetWifi</h1>
          <p className="text-xl md:text-2xl mb-8 text-light-red">
            Instant WiFi Access - No Account Needed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/portal.html'}
              className="bg-white text-primary-red px-8 py-3 rounded-lg font-bold hover:bg-light-red transition text-lg"
            >
              Access Portal
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary-red transition text-lg"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-primary-red mb-12">Why Choose StreetWifi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Instant Access</h3>
              <p className="text-gray-600">
                No registration required. Connect your device and pay instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Just 10 KES per hour. Pay only for what you use.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                M-Pesa payments via PayHero for safe, quick transactions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Easy One-Click</h3>
              <p className="text-gray-600">
                Select hours, enter phone number, pay. That's it!
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Flexible Hours</h3>
              <p className="text-gray-600">
                1 to 24 hours. Extend your session anytime you need more access.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-light-red p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Available 24/7</h3>
              <p className="text-gray-600">
                High-speed WiFi hotspots always on. Stay connected anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-light-red">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-primary-red mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-block bg-primary-red text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Connect</h3>
              <p className="text-gray-600">Join the StreetWifi network</p>
            </div>
            <div className="text-center">
              <div className="inline-block bg-primary-red text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Select Hours</h3>
              <p className="text-gray-600">Choose your WiFi duration</p>
            </div>
            <div className="text-center">
              <div className="inline-block bg-primary-red text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Pay via M-Pesa</h3>
              <p className="text-gray-600">Quick and secure payment</p>
            </div>
            <div className="text-center">
              <div className="inline-block bg-primary-red text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-primary-red mb-2">Enjoy Internet</h3>
              <p className="text-gray-600">Instant full WiFi access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-primary-red mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 5, 10].map((hours) => (
              <div
                key={hours}
                className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-primary-red"
              >
                <p className="text-3xl font-bold text-primary-red">{hours}h</p>
                <p className="text-sm text-gray-600 my-2">WiFi access</p>
                <p className="text-2xl font-bold text-primary-red">{hours * 10} KES</p>
                <p className="text-xs text-gray-600">10 KES per hour</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-red to-dark-red text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Connected?</h2>
          <p className="text-xl mb-8">Open the StreetWifi portal to get instant internet access.</p>
          <button
            onClick={() => window.location.href = '/portal.html'}
            className="bg-white text-primary-red px-10 py-3 rounded-lg font-bold hover:bg-light-red transition text-lg"
          >
            Access Portal Now
          </button>
        </div>
      </section>
    </div>
  );
}

