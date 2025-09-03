"use client";

import Footer from "@/components/user/footer";
import { useState, useEffect } from "react";
import PageLoader from "@/components/shared/page-loader";
import ContactHero from "@/components/user/contact/contact-hero";
import SendMessage from "@/components/user/contact/send-message";
import CTA from "@/components/user/contact/contact-cta";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.fonts.ready.then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <div className="text-gray-800 pt-18">
      <ContactHero />
      <SendMessage />
      <CTA />
      <Footer />
    </div>
  );
}
