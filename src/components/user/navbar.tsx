"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import NavbarSkeleton from "./navbar-skeleton";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Properties", href: "/listings" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.fonts.ready.then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white z-50 transition-all ${
        scrolled ? "border-b border-gray-300" : "border-b-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-700 mr-2">
              EthioAddis
            </Link>
            <span className="text-gray-500 text-xs font-light sm:block">
              Premium Properties
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10 h-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-2 text-lg font-medium hover:text-blue-700 hover:border-b-2 hover:border-blue-700 transition-colors",
                  pathname === link.href
                    ? "text-blue-700"
                    : "text-gray-800 border-transparen"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link href={"/contact"}>
              <div className="h-9 px-4 cursor-pointer hover:bg-gray-100 py-2 border border-gray-300 rounded text-sm bg-white text-black">
                <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                Call Now
              </div>
            </Link>
            <Link href="/listings">
              <button className="h-9 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-semibold transition">
                View Listings
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            {isMounted && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-gray-700"
              >
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t shadow px-4 pb-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium py-2 border-b",
                    pathname === link.href ? "text-blue-700" : "text-gray-700"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-4 space-y-3">
              <Link href="/contact">
                <div className="h-10 w-full flex justify-center items-center border border-gray-300 rounded text-sm bg-white text-black">
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                  Call Now
                </div>
              </Link>
              <Link href="/listings">
                <button className="h-10 w-full bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-semibold transition">
                  View Listings
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
