"use client";

import React from "react";

export default function CTA() {
  return (
    <section className="relative py-18 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-32 -translate-x-32"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-5">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="mb-6 mx-auto max-w-xl text-lg text-gray-300">
          Subscribe to our newsletter for the latest property listings, market
          insights, and real estate tips.
        </p>
        <div className="flex mx-auto max-w-96">
          <input
            type="email"
            placeholder="Your email address"
            className="px-3 py-2 bg-blue-50 border border-white border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm w-full"
          />
          <button className="px-3 py-2 text-sm bg-transparent text-white font-semibold rounded-r-md border border-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-all duration-100 group-hover:scale-105 flex items-center justify-center">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
