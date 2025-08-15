"use client";

import Image from "next/image";
import Link from "next/link";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { useMemo } from "react";

interface Listing {
  id: string;
  numericId: number;
  title: string;
  location: string;
  price: number;
  status?: string;
  createdAt: any;
}

const cities = [
  {
    name: "Addis Ababa",
    image: "/AddisAbaba.jpg",
    href: "/listings?city=Addis Ababa",
    searchTerms: ["addis ababa", "addis", "ababa"], // Multiple ways this city might appear
  },
  {
    name: "Hawassa",
    image: "/Hawassa.jpg",
    href: "/listings?city=Hawassa",
    searchTerms: ["hawassa", "awassa"], // Alternative spelling
  },
  {
    name: "Adama",
    image: "/Adama.jpg",
    href: "/listings?city=Adama",
    searchTerms: ["adama", "nazret"], // Alternative name
  },
  {
    name: "Jigjiga",
    image: "/Jigjiga.jpg",
    href: "/listings?city=Jigjiga",
    searchTerms: ["jigjiga", "jijiga"], // Alternative spelling
  },
];

export default function FeaturedCities() {
  // Fetch all listings
  const { data: allListings = [], isLoading } =
    useFirestoreCollection<Listing>("listings");

  // Calculate city counts using useMemo for performance
  const cityCounts = useMemo(() => {
    if (!allListings.length) return {};

    // Filter only available listings
    const availableListings = allListings.filter((listing) => listing.location);

    const counts: Record<string, number> = {};

    cities.forEach((city) => {
      const cityListings = availableListings.filter((listing) => {
        const location = listing.location.toLowerCase().trim();

        // Check if any of the search terms match the location
        return city.searchTerms.some((term) => location.includes(term));
      });

      counts[city.name] = cityListings.length;

      // Debug: show some example locations for this city
      if (process.env.NODE_ENV === "development" && cityListings.length > 0) {
      }
    });

    return counts;
  }, [allListings]);

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 mt-0 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Explore Featured Cities
            </h2>
            <p className="text-gray-600 text-[16px]">
              Discover top properties in Ethiopia's most popular destinations.
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {cities.map((city, idx) => (
              <div
                key={idx}
                className="relative group overflow-hidden rounded-md shadow animate-pulse"
              >
                <div className="w-full h-78 bg-gray-300"></div>
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                  <div className="h-6 bg-gray-400 rounded mb-2"></div>
                  <div className="h-4 bg-gray-400 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 mt-0 bg-gray-50 animate-on-scroll animate-pc-only delay-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
        {/* Heading */}
        <div className="text-center mb-12 animate-on-scroll animate-mobile-only delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Explore Featured Cities
          </h2>
          <p className="text-gray-600 text-[16px]">
            Discover top properties in Ethiopia's most popular destinations.
          </p>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {cities.map((city, idx) => {
            const count = cityCounts[city.name] || 0;

            return (
              <div
                key={idx}
                className={`animate-on-scroll animate-mobile-only delay-${
                  (idx + 1) * 200
                }`}
              >
                <Link
                  href={city.href}
                  className="relative group overflow-hidden rounded-md shadow hover:shadow-lg transition block"
                >
                  {/* Image */}
                  <Image
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    width={400}
                    height={600}
                    priority
                    className="w-full h-78 object-cover transform group-hover:scale-105 transition duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                    <h3 className="text-white text-lg font-semibold">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-200">
                      {count > 0 ? (
                        <>
                          {count} {count !== 1 ? "properties" : "property"}
                        </>
                      ) : (
                        <>No Properties</>
                      )}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
