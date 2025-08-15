"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./user/navbar";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const showNavbar = !pathname.startsWith("/admin");
  const [mounted, setMounted] = useState(false);

  // Initialize scroll animations
  useScrollAnimation();

  useEffect(() => {
    setMounted(true);

    // Force a reflow on mobile devices after mount
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, []);

  // Handle route changes - force animation recheck on mobile
  useEffect(() => {
    if (mounted && typeof window !== "undefined" && window.innerWidth < 768) {
      // Small delay to let the new page content render
      setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, 150);
    }
  }, [pathname, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {showNavbar && <Navbar />}

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
