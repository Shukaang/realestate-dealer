"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshake,
  faChartLine,
  faUsers,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function Missions() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 animate-on-scroll animate-pc-only animate-fade-in delay-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 mr-2" />
            Our Foundation
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Mission & Core Values
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built on principles that guide every interaction and decision we
            make
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Integrity First",
              desc: "We conduct business with unwavering ethical standards, ensuring complete transparency in every transaction. Your trust is our foundation.",
              icon: faHandshake,
              color: "blue",
            },
            {
              title: "Excellence Driven",
              desc: "From property selection to client service, we pursue excellence in every detail. Our commitment to quality sets the industry standard.",
              icon: faChartLine,
              color: "green",
            },
            {
              title: "Client Centered",
              desc: "Every decision we make prioritizes our clients' needs and goals. We listen, understand, and deliver beyond expectations.",
              icon: faUsers,
              color: "purple",
            },
          ].map((value, index) => (
            <div
              key={index}
              className="group bg-white p-8 animate-on-scroll animate-mobile-only animate-fade-in delay-200 rounded-2xl shadow-lg hover:shadow-md border border-gray-100 hover:border-blue-200"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-${value.color}-100 flex items-center justify-center text-${value.color}-700 mx-auto mb-6`}
              >
                <FontAwesomeIcon icon={value.icon} className="text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-4 text-gray-900">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
