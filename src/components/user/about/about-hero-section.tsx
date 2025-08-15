"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faAward,
  faHome,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-5 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-32 -translate-x-32"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 rounded-full text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/20">
          <FontAwesomeIcon icon={faAward} className="w-4 h-4 mr-2" />
          Ethiopia's Premier Real Estate Company
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          About <span className="text-blue-300">EthioAddis</span>
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Transforming Ethiopia's real estate landscape through innovation,
          integrity, and unparalleled service excellence since 2025.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="flex items-center text-blue-200 animate-slide-left delay-300">
            <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-2" />
            <span>1,200+ Properties Sold</span>
          </div>
          <div className="flex items-center text-blue-200 animate-scale-up delay-400">
            <FontAwesomeIcon icon={faUsers} className="w-5 h-5 mr-2" />
            <span>98% Client Satisfaction</span>
          </div>
          <div className="flex items-center text-blue-200 animate-slide-right delay-300">
            <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 mr-2" />
            <span>15+ Cities Covered</span>
          </div>
        </div>
      </div>
    </section>
  );
}
