"use client";

import Image from "next/image";
import Link from "next/link";

const cities = [
  {
    name: "Addis Ababa",
    image: "/AddisAbaba.jpg",
    listings: 12,
    href: "/listings",
  },
  {
    name: "Hawassa",
    image: "/Hawassa.jpg",
    listings: 8,
    href: "/listings",
  },
  {
    name: "Adama",
    image: "/Adama.jpg",
    listings: 6,
    href: "/listings",
  },
  {
    name: "Jigjiga",
    image: "/Jigjiga.jpg",
    listings: 5,
    href: "/listings",
  },
];

export default function FeaturedCities() {
  return (
    <section className="py-16 mt-0 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Explore Featured Cities
          </h2>
          <p className="text-gray-600 text-[16px]">
            Discover top properties in Ethiopia’s most popular destinations.
          </p>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {cities.map((city, idx) => (
            <Link
              href={city.href}
              key={idx}
              className="relative group overflow-hidden rounded-md shadow hover:shadow-lg transition"
            >
              {/* Image */}
              <Image
                src={city.image}
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
                  {city.listings}+ Properties
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
