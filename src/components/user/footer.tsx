"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faCcAmex,
  faTelegram,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-[#0d0d1d] text-white px-6 md:px-4 pt-16 pb-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="animate-on-scroll animate-mobile-only delay-100">
          <h2 className="text-2xl font-bold mb-3">EthioAddis</h2>
          <p className="text-sm text-gray-400 mb-4">
            Your trusted partner in finding your dream home. We provide
            exceptional service with a personal touch.
          </p>
          <div className="flex space-x-4 text-gray-400">
            <Link href="https://www.facebook.com/share/1CcWSpShwx/">
              <FontAwesomeIcon
                icon={faFacebookF}
                className="hover:text-white"
              />
            </Link>
            <Link href="https://x.com/mc_shukang?t=U9lXW4mBm0z6SuMfKBgc6g&s=09">
              <FontAwesomeIcon icon={faXTwitter} className="hover:text-white" />
            </Link>
            <Link href="https://www.instagram.com/mc_shukang?igsh=MTVseHBsaWhiOHE5ZQ==">
              <FontAwesomeIcon
                icon={faInstagram}
                className="hover:text-white"
              />
            </Link>
            <Link href="https://www.linkedin.com/in/shueb-ahmed-77b3132a5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
              <FontAwesomeIcon
                icon={faLinkedinIn}
                className="hover:text-white"
              />
            </Link>
            <Link href="https://t.me/ShuebAhmed">
              <FontAwesomeIcon icon={faTelegram} className="hover:text-white" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="animate-on-scroll animate-mobile-only delay-100">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400 inline-block">
            <li className="hover:text-white">
              <Link href="/">Home</Link>
            </li>
            <li className="hover:text-white">
              <Link href="/listings">Properties</Link>
            </li>
            <li className="hover:text-white">
              <Link href="/about">About Us</Link>
            </li>
            <li className="hover:text-white">
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="animate-on-scroll animate-mobile-only delay-100">
          <h3 className="text-lg font-semibold mb-3">Contact Info</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-blue-400 mt-1"
              />
              <span>
                Bole sub-City, Zone 1 Ja'far Mosque
                <br />
                Addis Ababa, Ethiopia
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-blue-400 mt-1" />
              <span>+251 991 868 812</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-blue-400 mt-1"
              />
              <span>info@ethioaddis.com</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faClock} className="text-blue-400 mt-1" />
              <span>Mon-Fri: 9AM - 6PM</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="animate-on-scroll animate-mobile-only delay-100">
          <h3 className="text-lg font-semibold mb-3">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">
            Subscribe to our newsletter for the latest property updates.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 border border-gray-700 border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-800 text-gray-400 text-sm w-full"
            />
            <button className="bg-blue-600 px-4 rounded-r text-white hover:bg-blue-700">
              Subscribe
            </button>
          </div>
          <div className="flex space-x-4 mt-4 text-white">
            <FontAwesomeIcon
              icon={faCcVisa}
              className="text-2xl text-gray-400"
            />
            <FontAwesomeIcon
              icon={faCcMastercard}
              className="text-2xl text-gray-400"
            />
            <FontAwesomeIcon
              icon={faCcPaypal}
              className="text-2xl text-gray-400"
            />
            <FontAwesomeIcon
              icon={faCcAmex}
              className="text-2xl text-gray-400"
            />
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 mt-12 border-t px-5 border-t-gray-800 pt-10">
        &copy; {new Date().getFullYear()} EthioAddis. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
