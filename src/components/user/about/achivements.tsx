"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUsers,
  faAward,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

const StatBox = ({
  number,
  label,
  icon,
  description,
}: {
  number: string;
  label: string;
  icon: any;
  description: string;
}) => (
  <div className="group bg-white rounded-2xl shadow-lg p-8 animate-on-scroll animate-mobile-only animate-fade-in delay-100 text-center hover:shadow-md border border-gray-100 hover:border-blue-200">
    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-4">
      <FontAwesomeIcon icon={icon} className="text-2xl" />
    </div>
    <div className="text-4xl font-bold text-blue-700 mb-2">{number}</div>
    <div className="text-lg font-semibold text-gray-900 mb-2">{label}</div>
    <div className="text-sm text-gray-600">{description}</div>
  </div>
);

export default function Achivements() {
  return (
    <section className="py-20 bg-white animate-on-scroll animate-pc-only animate-fade-in delay-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
          <div className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faAward} className="w-4 h-4 mr-2" />
            Our Impact
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Achievements That Matter
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Numbers that reflect our commitment to excellence and client
            satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatBox
            number="1,200+"
            label="Properties Sold"
            icon={faHome}
            description="Successful transactions across Ethiopia"
          />
          <StatBox
            number="$1.2B+"
            label="Sales Volume"
            icon={faChartLine}
            description="Total value of properties handled"
          />
          <StatBox
            number="98%"
            label="Client Satisfaction"
            icon={faUsers}
            description="Based on post-transaction surveys"
          />
          <StatBox
            number="15+"
            label="Industry Awards"
            icon={faAward}
            description="Recognition for excellence"
          />
        </div>
      </div>
    </section>
  );
}
