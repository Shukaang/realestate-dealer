"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import ContactForm from "./contact-form";

export default function SendMessage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div className="lg:flex gap-8">
        {/* Left: Send Message */}
        <div className="lg:w-1/2 bg-white sm:p-6 p-2 shadow-md rounded-md space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="w-2 h-8 bg-blue-700 mr-3 rounded-full"></span>
            Send Us a Message
          </h2>
          <ContactForm />
        </div>

        {/* Right: Contact Info */}
        <div className="lg:w-1/2 mt-10 lg:mt-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="w-2 h-8 bg-blue-700 mr-3 rounded-full"></span>
            Contact Information
          </h2>
          <div className="p-3 sm:p-6 shadow-md rounded-md space-y-5 text-gray-700">
            <div className="flex items-start mb-5 gap-3">
              <div className="w-11 h-11 flex items-center justify-center text-blue-700 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg mb-2 text-slate-900">Our Office</h3>
                <p className="text-gray-700 text-sm">
                  Bole Michael, Addis Ababa
                </p>
              </div>
            </div>

            <div className="flex items-start mb-5 gap-3">
              <div className="w-11 h-11 flex items-center justify-center text-blue-700 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faPhone} className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg mb-2 text-slate-900">Phone</h3>
                <p className="text-gray-700 text-sm">+251 - 991 868 812</p>
                <p className="text-gray-700 text-sm">+251 - 704 988 812</p>
              </div>
            </div>

            <div className="flex items-start mb-5 gap-3">
              <div className="w-11 h-11 flex items-center justify-center text-blue-700 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg mb-2 text-slate-900">Email</h3>
                <p className="text-gray-700 text-sm">info@ethiaddis.com</p>
              </div>
            </div>

            <div className="flex items-start mb-5 gap-3">
              <div className="w-11 h-11 flex items-center justify-center text-blue-700 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faClock} className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg mb-2 text-slate-900">Business Hours</h3>
                <p className="text-gray-700 text-sm">
                  Monday - Friday: 9:00 AM - 6:00 PM
                </p>
                <p className="text-gray-700 text-sm">
                  Saturday: 10:00 AM - 4:00 PM
                </p>
                <p className="text-gray-700 text-sm">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
