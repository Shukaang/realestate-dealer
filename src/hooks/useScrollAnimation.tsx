"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useScrollAnimation() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pathname = usePathname();
  const initializedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Clear initialized elements tracking
    initializedElementsRef.current.clear();

    // Reset all animation elements to their default state
    const resetElements = () => {
      const allAnimationElements = document.querySelectorAll(
        ".animate-on-scroll, .animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale-up, .animate-mobile-only, .animate-pc-only, .animate-desktop-only"
      );

      allAnimationElements.forEach((element) => {
        element.classList.remove("animate-visible", "animate-hidden");
      });
    };

    // Initialize animations
    const initializeAnimations = () => {
      resetElements();

      const screenWidth = window.innerWidth;

      // Create intersection observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("animate-hidden");
              entry.target.classList.add("animate-visible");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      // Find and process animation elements
      const animationElements = document.querySelectorAll(
        ".animate-on-scroll, .animate-fade-in, .animate-slide-left, .animate-slide-right, .animate-scale-up, .animate-mobile-only, .animate-pc-only, .animate-desktop-only"
      );

      animationElements.forEach((element) => {
        // Skip if already processed
        if (initializedElementsRef.current.has(element)) return;

        const classList = element.classList;
        let shouldAnimate = false;

        // Check responsive conditions
        if (classList.contains("animate-mobile-only")) {
          shouldAnimate = screenWidth < 768;
        } else if (classList.contains("animate-pc-only")) {
          shouldAnimate = screenWidth >= 768;
        } else if (classList.contains("animate-desktop-only")) {
          shouldAnimate = screenWidth >= 1024;
        } else {
          // Regular animation classes work on all screen sizes
          shouldAnimate = true;
        }

        if (shouldAnimate) {
          element.classList.add("animate-hidden");
          observerRef.current?.observe(element);
        } else {
          // Element should remain visible (no animation on this screen size)
          element.classList.remove("animate-hidden");
        }

        initializedElementsRef.current.add(element);
      });
    };

    // Initialize with a small delay to ensure DOM is ready
    const initTimer = setTimeout(initializeAnimations, 100);

    // Handle window resize
    const handleResize = () => {
      initializeAnimations();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("resize", handleResize);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      initializedElementsRef.current.clear();
    };
  }, [pathname]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      initializedElementsRef.current.clear();
    };
  }, []);
}
