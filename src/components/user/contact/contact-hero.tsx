"use client";

import React from "react";

export default function ContactHero() {
  return (
    <section className="relative bg-gradient-to-br text-center py-20 from-blue-900 via-slate-800 to-blue-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/30 rounded-full translate-y-32 -translate-x-32"></div>

      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-gray-400 max-w-xl mx-auto">
        We're here to help with all your real estate needs. Reach out to us with
        any questions or inquiries.
      </p>
    </section>
  );
}
