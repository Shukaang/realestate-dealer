"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

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

export default function Hero() {
  const { data: listings = [] } = useFirestoreCollection<any>("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Memoized filter application
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.createdAt?.toDate && l.status == "available")
      .filter((l) => {
        const query = searchQuery.toLowerCase();
        const location = l.location?.toLowerCase() ?? "";
        const title = l.title?.toLowerCase() ?? "";
        const matchesSearch = searchQuery
          ? title.includes(query) || location.includes(query)
          : true;

        const matchesCity = selectedCity
          ? location.includes(selectedCity.toLowerCase())
          : true;

        const matchesType = selectedType
          ? l.type?.toLowerCase() === selectedType.toLowerCase()
          : true;

        const matchesPrice = (() => {
          const price = parseInt(l.price);
          if (!selectedPrice) return true;
          if (selectedPrice === "$0 - $1,000,000") return price < 1_000_000;
          if (selectedPrice === "$1,000,000 - $5,000,000")
            return price >= 1_000_000 && price < 5_000_000;
          if (selectedPrice === "$5,000,000 - $10,000,000")
            return price >= 5_000_000 && price < 10_000_000;
          if (selectedPrice === "$10,000,000 - $20,000,000")
            return price >= 10_000_000 && price < 20_000_000;
          if (selectedPrice === "$20,000,000+") return price >= 20_000_000;
          return true;
        })();

        return matchesSearch && matchesCity && matchesType && matchesPrice;
      })
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
  }, [listings, searchQuery, selectedCity, selectedType, selectedPrice]);

  // For search dropdown - first 5 listings
  const searchResults = useMemo(() => filteredListings, [filteredListings]);

  const totalMatches = filteredListings.length;
  const { data } = useFirestoreCollection<Listing>("listings");

  return (
    <section className="relative h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <Image
        src="/main-hero-bg.png"
        fill
        alt="Hero Background"
        className="object-cover opacity-70"
        priority
      />
      <div className="relative z-10 text-center w-full px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-4 drop-shadow-lg">
          Find Your Dream Home
        </h1>
        <p className="max-w-xl mx-auto text-lg text-blue-50 mb-8">
          Discover quality properties in top cities with our expert agents.
        </p>
        {/* Search Box */}
        <div className="backdrop-blur-none p-6 rounded-xl shadow-xl w-full max-w-5xl mx-auto space-y-4 text-left">
          {/* Filter Summary Bar */}
          {(searchQuery || selectedCity || selectedType || selectedPrice) && (
            <div className="text-sm text-white bg-blue-800/80 px-4 py-2 rounded-lg">
              Showing {totalMatches}{" "}
              {totalMatches !== 1 ? "properties" : "property"}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedType && ` of type "${selectedType}"`}
              {selectedCity && ` in ${selectedCity}`}
              {selectedPrice && ` priced ${selectedPrice}`}
            </div>
          )}

          <div
            className="grid grid-cols-1 md:grid-cols-5 gap-4 relative"
            ref={searchRef}
          >
            {/* Search Input with Count Badge */}
            <div className="col-span-2 relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  placeholder="Search by title, location, type..."
                  className="w-full h-10 text-black px-4 text-sm rounded-md border bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                {searchQuery && (
                  <span className="absolute right-10 top-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {totalMatches} found
                  </span>
                )}
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute right-3 top-3 text-gray-400"
                />
              </div>

              {/* Enhanced Search Dropdown */}
              {showSearchResults && (
                <div className="absolute z-60 mt-1 w-full bg-gray-50 rounded-md shadow-lg border border-gray-200 max-h-40 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="px-3 py-2 text-xs text-gray-500 border-b">
                          Showing {Math.min(searchResults.length)} of{" "}
                          {totalMatches} matches
                        </div>
                        {totalMatches >= 3 && (
                          <div className="p-3 text-center text-sm text-blue-600 hover:bg-blue-50 border-t">
                            <Link
                              href={`/listings?search=${encodeURIComponent(
                                searchQuery
                              )}${selectedCity ? `&city=${selectedCity}` : ""}${
                                selectedType ? `&type=${selectedType}` : ""
                              }${
                                selectedPrice ? `&price=${selectedPrice}` : ""
                              }`}
                              onClick={() => setShowSearchResults(false)}
                            >
                              View all {totalMatches} properties →
                            </Link>
                          </div>
                        )}
                      </div>
                      {searchResults.map((listing) => (
                        <Link
                          key={listing.id}
                          href={`/listings/${listing.numericId}`}
                          className="flex items-center p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={listing.images?.[0] ?? "/Big Home1.jpg"}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {listing.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-1 text-blue-600"
                                size="xs"
                              />
                              <span>{listing.location}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No properties match your search
                    </div>
                  )}
                </div>
              )}
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-10 px-3 text-sm rounded-md border bg-gray-50 border-gray-300 text-black placeholder-white focus:ring-0 focus:outline-none"
            >
              <option value="">City</option>
              <option>Adama</option>
              <option>Addis Ababa</option>
              <option>Bahirdar</option>
              <option>Hawassa</option>
              <option>Jigjiga</option>
              <option>Negele</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 text-sm rounded-md border bg-gray-50 border-gray-300 text-black placeholder-white focus:ring-0 focus:outline-none"
            >
              <option value="">Property Type</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Villa</option>
              <option>Penthouse</option>
              <option>Mansion</option>
            </select>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="h-10 px-3 text-sm rounded-md border bg-gray-50 border-gray-300 text-black placeholder-white focus:ring-0 focus:outline-none"
            >
              <option value="">Price Range</option>
              <option>$0 - $1,000,000</option>
              <option>$1,000,000 - $5,000,000</option>
              <option>$5,000,000 - $10,000,000</option>
              <option>$10,000,000 - $20,000,000</option>
              <option>$20,000,000+</option>
            </select>
          </div>
          <div className="text-center pt-2">
            <Link href={"/listings"}>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition duration-200">
                <FontAwesomeIcon icon={faSearch} />
                Search
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
