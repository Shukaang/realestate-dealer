"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function OurStory() {
  return (
    <section className="py-20 px-5 bg-white animate-on-scroll animate-pc-only delay-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {/* ✅ Animate this block on mobile only */}
            <div className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-4">
                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                Our Journey
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
            </div>

            {/* ✅ Animate text paragraph block on mobile only */}
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                Founded in 2025,{" "}
                <strong className="text-blue-700">EthioAddis</strong> emerged
                from a vision to revolutionize Ethiopia's real estate market. We
                recognized the need for a modern, transparent, and
                client-focused approach to property transactions in our rapidly
                growing nation.
              </p>
              <p className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                What began as a small team of passionate real estate
                professionals has evolved into Ethiopia's most trusted property
                consultancy. Our deep understanding of local markets, combined
                with international best practices, has enabled us to serve
                clients across major Ethiopian cities.
              </p>
              <p className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                Today, we pride ourselves on being more than just a real estate
                company. We are community builders, dream facilitators, and
                trusted advisors who understand that every property transaction
                represents a significant milestone in our clients' lives.
              </p>
            </div>

            {/* ✅ Animate stats (founded, cities) on mobile only */}
            <div className="grid grid-cols-2 gap-6 pt-6 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  2025
                </div>
                <div className="text-sm text-gray-600">Founded</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-700 mb-2">15+</div>
                <div className="text-sm text-gray-600">Cities Served</div>
              </div>
            </div>
          </div>

          {/* ✅ Animate image only on mobile */}
          <div className="relative animate-on-scroll animate-mobile-only animate-fade-in delay-400">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl transform rotate-3"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl">
              <Image
                src="/main-hero-bg.png"
                alt="EthioAddis Office"
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
