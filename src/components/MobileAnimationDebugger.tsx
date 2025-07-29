"use client";

import { useEffect, useState } from "react";

export default function MobileAnimationDebugger() {
  const [debugInfo, setDebugInfo] = useState({
    screenWidth: 0,
    isMobile: false,
    elementsFound: 0,
    pathname: "",
    userAgent: "",
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 768;
      const elementsFound = document.querySelectorAll(
        ".animate-on-scroll, .animate-mobile-only, .animate-pc-only"
      ).length;

      setDebugInfo({
        screenWidth,
        isMobile,
        elementsFound,
        pathname: window.location.pathname,
        userAgent: navigator.userAgent.includes("Mobile")
          ? "Mobile"
          : "Desktop",
      });
    };

    updateDebugInfo();
    window.addEventListener("resize", updateDebugInfo);

    return () => window.removeEventListener("resize", updateDebugInfo);
  }, []);

  // Only show on mobile and in development
  if (
    typeof window === "undefined" ||
    window.innerWidth >= 768 ||
    process.env.NODE_ENV !== "development"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">📱 Mobile Debug</div>
      <div>Width: {debugInfo.screenWidth}px</div>
      <div>Mobile: {debugInfo.isMobile ? "✅" : "❌"}</div>
      <div>Elements: {debugInfo.elementsFound}</div>
      <div>Page: {debugInfo.pathname}</div>
      <div>UA: {debugInfo.userAgent}</div>
    </div>
  );
}
