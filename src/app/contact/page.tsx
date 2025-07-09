"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "@/components/user/Footer";
import ContactForm from "@/components/UserMessage";

export default function ContactPage() {
  return (
    <div className="text-gray-800 pt-10">
      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 text-center">
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
          <div className="lg:w-1/2 bg-white p-6 shadow-md rounded-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Right: Contact Info */}
          <div className="lg:w-1/2 mt-10 lg:mt-0 space-y-5">
            <h2 className="text-2xl font-semibold text-gray-800 mb-5">
              Contact Information
            </h2>
            <div className="bg-gray-50 p-6 shadow-md rounded-md space-y-5 text-gray-700">
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
      <section className="bg-blue-700 text-white py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="mb-6 mx-auto max-w-xl text-lg text-gray-300">
          Subscribe to our newsletter for the latest property listings, market
          insights, and real estate tips.
        </p>
        <div className="flex mx-auto max-w-96 ">
          <input
            type="email"
            placeholder="Your email address"
            className="px-3 py-2 bg-white border border-gray-700 border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-600 text-sm w-full"
          />
          <button className="bg-black px-3 text-[13px] font-semibold rounded-sm text-white hover:bg-gray-800">
            Subscribe
          </button>
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
