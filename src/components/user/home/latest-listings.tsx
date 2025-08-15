"use client";

import React from "react";
import Link from "next/link";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PropertyCard from "../property-card";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowRight,
  faMapMarkerAlt,
  faHome,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

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

export default function LatestListings() {
  const { data: listings = [] } = useFirestoreCollection<any>("listings");

  // Memoized filter application
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.createdAt?.toDate && l.status == "available")

      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
  }, [listings]);

  // For display - first 6 listings
  const displayedListings = filteredListings.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-5">
      <div className="flex justify-between mb-10 items-end">
        <div>
          <h1 className="text-3xl font-bold">Latest Listings</h1>
          <p className="text-sm text-gray-600 mt-2">
            Explore our newest properties on the market
          </p>
        </div>
        <Link href="/listings">
          <div className="inline-flex items-center gap-2 px-5 py-2 border border-blue-700 text-blue-700 font-medium text-sm rounded-md transition group hover:bg-blue-50">
            <p className="whitespace-nowrap">View All</p>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {displayedListings.map((listing) => (
          <PropertyCard key={listing.id} property={listing} view="grid" />
        ))}
      </div>
    </section>
  );
}
