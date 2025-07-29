"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "@/components/user/Footer";
import ContactForm from "@/components/UserMessage";
import { useState, useEffect } from "react";
import PageLoader from "@/components/shared/PageLoader";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (remove this in production)
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }
  return (
    <div className="text-gray-800 pt-10">
      {/* Hero */}
      <section className="relative bg-gradient-to-br text-center py-20 from-blue-900 via-slate-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/30 rounded-full translate-y-32 -translate-x-32"></div>

        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          We're here to help with all your real estate needs. Reach out to us
          with any questions or inquiries.
        </p>
      </section>

      {/* Send a Message & Contact Info */}
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
                  <h3 className="text-lg mb-2 text-slate-900">
                    Business Hours
                  </h3>
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

      {/* CTA Section */}
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
      <Footer />
    </div>
  );
}

function ContactInfo({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-4">
      <div>{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
