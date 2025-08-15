"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function CTA() {
  return (
    <section className="my-0 animate-on-scroll delay-200 relative py-18 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-32 -translate-x-32"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-5">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Find Your Dream Home?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Let our experts guide you through the process of finding the perfect
          property that meets all your requirements.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/listings" className="group">
            <button className="px-3 py-2 text-sm bg-white animate-on-scroll delay-100 text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
              <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-2" />
              Browse Properties
            </button>
          </Link>
          <Link href="/contact" className="group">
            <button className="px-3 py-2 text-sm bg-transparent animate-on-scroll delay-100 text-white font-semibold rounded-xl border border-white hover:bg-white hover:text-blue-700 transition-all duration-100 group-hover:scale-105 flex items-center justify-center">
              <FontAwesomeIcon icon={faPhone} className="w-5 h-5 mr-2" />
              Contact Us
            </button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-200">
          <div className="flex items-center animate-slide-left delay-100">
            <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2" />
            <span>+251 991 868 812</span>
          </div>
          <div className="flex items-center animate-slide-right delay-100">
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
            <span>info@ethioaddis.com</span>
          </div>
        </div>
      </div>
    </section>
  );
}
