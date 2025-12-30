import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6">
          Sell Your Digital Content,
          <br />
          <span className="text-primary-600">Your Way</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          A marketplace for creators to sell photos, videos, music, courses, and more.
          Set your own prices, build your audience, and earn on your terms.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/explore" className="btn-primary text-lg px-8 py-3">
            Explore Content
          </Link>
          <Link to="/register" className="btn-secondary text-lg px-8 py-3">
            Become a Creator
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-bold mb-2">For Creators</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload any digital content, set your prices, and earn from your creations.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Stripe and crypto support with automatic payouts and secure transactions.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🎧</div>
          <h3 className="text-xl font-bold mb-2">Built-in Player</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Stream music and videos with our secure, high-quality media player.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join thousands of creators already earning on LookSell
        </p>
        <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
