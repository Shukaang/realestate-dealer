"use client";

import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PageLoader from "@/components/shared/page-loader";
import Footer from "@/components/user/footer";
import MainTestimonial from "@/components/user/home/main-testimonials";
import WhyChooseUs from "@/components/user/home/why-choose-us";
import FeaturedCities from "@/components/user/home/featured-city";
import Hero from "@/components/user/home/hero";
import LatestListings from "@/components/user/home/latest-listings";
import CTA from "@/components/user/home/cta";

interface Listing {
  id: string;
  numericId: number;
  title: string;
  location: string;
  price: number;
  description?: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  area: string;
  type?: string;
  status?: string;
  createdAt: any;
}

export default function HomePage() {
  const { isLoading } = useFirestoreCollection<Listing>("listings");

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-24 pt-10">
      <Hero />
      <LatestListings />
      <WhyChooseUs />
      <MainTestimonial />
      <FeaturedCities />
      <CTA />
      <Footer />
    </div>
  );
}
