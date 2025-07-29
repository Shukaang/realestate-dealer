// components/ScrollAnimationManager.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollAnimationManager() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            entry.target.classList.remove("animate-hidden");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const initAnimations = () => {
      // Get all potential animation targets
      const animationTargets = document.querySelectorAll(
        "[class*='animate-']:not(.animate-visible):not(.animate-hidden)"
      );

      animationTargets.forEach((element) => {
        // Skip if already initialized
        if (element.classList.contains("animate-initialized")) return;

        element.classList.add("animate-hidden", "animate-initialized");

        // Check responsive conditions
        const isMobileOnly = element.classList.contains("animate-mobile-only");
        const isPcOnly = element.classList.contains("animate-pc-only");
        const isDesktopOnly = element.classList.contains(
          "animate-desktop-only"
        );

        const screenWidth = window.innerWidth;
        const shouldAnimate =
          (!isMobileOnly && !isPcOnly && !isDesktopOnly) ||
          (isMobileOnly && screenWidth < 768) ||
          (isPcOnly && screenWidth >= 768) ||
          (isDesktopOnly && screenWidth >= 1024);

        if (shouldAnimate) {
          observer.observe(element);
        } else {
          element.classList.remove("animate-hidden");
        }
      });
    };

    // Initialize animations on mount and path change
    initAnimations();

    // Re-check when window is resized
    const handleResize = () => {
      initAnimations();
      window.dispatchEvent(new Event("scroll"));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]); // Re-run on path change

  return null;
}
