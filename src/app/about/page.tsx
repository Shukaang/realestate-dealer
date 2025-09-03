"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/user/footer";
import PageLoader from "@/components/shared/page-loader";
import HeroSection from "@/components/user/about/about-hero-section";
import OurStory from "@/components/user/about/our-story";
import Missions from "@/components/user/about/missions";
import Achivements from "@/components/user/about/achivements";
import OurTeams from "@/components/user/about/our-teams";
import MainTestimonial from "@/components/user/main-testimonials";
import CTA from "@/components/user/about/abou-cta";

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.fonts.ready.then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="pt-18">
      <HeroSection />
      <OurStory />
      <Missions />
      <Achivements />
      <OurTeams />
      <MainTestimonial />
      <CTA />
      <Footer />
    </div>
  );
}
