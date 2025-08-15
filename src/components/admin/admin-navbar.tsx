//components/AdminNavbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { logout } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, role, hasPermission } = useAuth();

  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Handle dark mode
  useEffect(() => {
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const savedTheme = localStorage.theme;
    const shouldUseDark =
      savedTheme === "dark" || (!savedTheme && isSystemDark);
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.theme = nextDark ? "dark" : "light";
    setIsDark(nextDark);
  };

  const { data: adminsData = [] } = useFirestoreCollection("admins");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminsData.length > 0) {
        const matchedAdmin = (adminsData as Admin[]).find(
          (admin) => admin.email === user.email
        );
        if (matchedAdmin) {
          setAdminName(`${matchedAdmin.firstName} ${matchedAdmin.lastName}`);
        }
      }
    });
    return () => unsubscribe();
  }, [adminsData]);

  // Hide navbar on login page or outside /admin
  if (pathname === "/admin/login" || !pathname.startsWith("/admin"))
    return null;

  const navLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      permission: "view-dashboard",
    },
    {
      href: "/admin/listings",
      label: "Listings",
      permission: "view-listings",
    },
    {
      href: "/admin/appointments",
      label: "Appointments",
      permission: "view-appointments",
    },
    {
      href: "/admin/upload",
      label: "Upload",
      permission: "upload-content",
    },
    {
      href: "/admin/usermessages",
      label: "Usermessages",
      permission: "view-messages",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      permission: "manage-admins",
    },
    {
      href: "/admin/settings/create-admin",
      label: "Create Admin",
      permission: "manage-admins",
    },
  ];

  const visibleLinks = navLinks.filter((link) =>
    hasPermission(link.permission)
  );

  return (
    <nav className="bg-gray-900 dark:bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/admin"
            className={`text-xl font-semibold transition ${
              pathname === "/admin"
                ? "text-blue-400"
                : "text-gray-300 hover:text-blue-400"
            } `}
          >
            Admin Panel
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor">
              {mobileMenuOpen ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
          </button>

          {/* Desktop nav */}
          <div className="hidden sm:flex gap-6">
            {visibleLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClass(pathname, href)}
              >
                {label}
              </Link>
            ))}
          </div>
          {/* Admin Info, Dark Mode, Logout */}
          <div className="hidden sm:flex items-center gap-4 ml-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {adminName && (
              <span className="text-gray-300 truncate max-w-[150px]">
                {adminName}
              </span>
            )}

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden flex flex-col gap-3 py-3">
            {visibleLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md ${
                  pathname === href
                    ? "bg-blue-700 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-700 inline-block"
              aria-label="Toggle dark mode"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="flex justify-between items-center px-4 mt-4">
              {adminName && (
                <span className="text-blue-600 font-bold truncate max-w-[150px]">
                  {adminName}
                </span>
              )}
              <button
                onClick={logout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function navLinkClass(pathname: string, href: string) {
  const isActive = pathname === href;
  return `text-sm hover:text-blue-400 transition ${
    isActive ? "text-blue-400 font-medium" : "text-gray-300"
  }`;
}

function SunIcon() {
  return (
    <svg
      className="h-6 w-6 text-yellow-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07 6.07l-.7-.7M6.34 6.34l-.7-.7m12.02 12.02l-.7-.7M6.34 17.66l-.7-.7M12 7a5 5 0 000 10 5 5 0 000-10z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-6 w-6 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
      />
    </svg>
  );
}
