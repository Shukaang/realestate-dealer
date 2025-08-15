"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowRight,
  faMapMarkerAlt,
  faTimes,
  faChevronDown,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PageLoader from "@/components/shared/page-loader";
import Footer from "@/components/user/footer";
import PropertyCard from "@/components/user/property-card";
import MainTestimonial from "@/components/user/home/main-testimonials";
import WhyChooseUs from "@/components/user/home/why-choose-us";
import FeaturedCities from "@/components/user/home/featured-city";
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
  area: number;
  type: string;
  status: string;
  for: string;
  createdAt: any;
}

export default function HomePage() {
  const { data: listings = [], isLoading } =
    useFirestoreCollection<Listing>("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
          const price = l.price;
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

  // For display - first 6 listings
  const displayedListings = filteredListings.slice(0, 6);

  // For search dropdown - first 5 listings
  const searchResults = useMemo(() => filteredListings, [filteredListings]);

  // Total count of matching listings
  const totalMatches = filteredListings.length;

  // Calculate active filters
  const activeFilters = [
    searchQuery && `Search: "${searchQuery}"`,
    selectedCity && `City: ${selectedCity}`,
    selectedType && `Type: ${selectedType}`,
    selectedPrice && `Price: ${selectedPrice}`,
  ].filter(Boolean);

  const activeFilterCount = activeFilters.length;

  if (isLoading) return <PageLoader />;

  // Filter tag component
  const FilterTag = ({
    label,
    onRemove,
  }: {
    label: string;
    onRemove: () => void;
  }) => (
    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-blue-800 hover:text-blue-900 focus:outline-none"
      >
        <FontAwesomeIcon icon={faTimes} size="xs" />
      </button>
    </div>
  );

  return (
    <div className="space-y-24 pt-10">
      {/* Hero Section */}
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

          {/* Modern Search Container */}
          <div className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto space-y-4 text-left border border-white/20">
            {/* Mobile Filters Button */}
            <div className="md:hidden flex justify-center mb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </span>
              </button>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <FilterTag
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => setSearchQuery("")}
                />
              )}
              {selectedCity && (
                <FilterTag
                  label={`City: ${selectedCity}`}
                  onRemove={() => setSelectedCity("")}
                />
              )}
              {selectedType && (
                <FilterTag
                  label={`Type: ${selectedType}`}
                  onRemove={() => setSelectedType("")}
                />
              )}
              {selectedPrice && (
                <FilterTag
                  label={`Price: ${selectedPrice}`}
                  onRemove={() => setSelectedPrice("")}
                />
              )}
            </div>

            {/* Enhanced Search Grid */}
            <div
              className={`grid ${
                isExpanded
                  ? "grid-cols-1 md:grid-cols-5"
                  : "grid-cols-1 md:grid-cols-4"
              } gap-4 relative`}
              ref={searchRef}
            >
              {/* Advanced Search Input */}
              <div
                className={`${
                  isExpanded ? "md:col-span-2" : "md:col-span-3"
                } relative`}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                    placeholder="Search by title, location, amenities..."
                    className="w-full h-14 text-black px-5 pr-12 text-base rounded-xl border-0 bg-white shadow-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-blue-600"
                    />
                  </div>
                </div>

                {/* Modern Search Dropdown */}
                {showSearchResults && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                    {/* Dropdown Header */}
                    <div className="sticky top-0 bg-white p-4 border-b z-10">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">
                          Matching Properties
                        </h3>
                        <span className="text-sm text-gray-500">
                          {totalMatches} results
                        </span>
                      </div>
                    </div>

                    {/* Results List */}
                    <div className="divide-y divide-gray-100">
                      {searchResults.length > 0 ? (
                        searchResults.slice(0, 5).map((listing) => (
                          <Link
                            key={listing.id}
                            href={`/listings/${listing.numericId}`}
                            className="flex p-4 hover:bg-blue-50 transition-colors"
                            onClick={() => setShowSearchResults(false)}
                          >
                            <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden">
                              <Image
                                src={
                                  listing.images?.[0] ??
                                  "/property-placeholder.jpg"
                                }
                                alt={listing.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <h3 className="text-base font-medium text-gray-900 truncate">
                                {listing.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="mr-1.5 text-blue-600"
                                  size="xs"
                                />
                                <span className="truncate">
                                  {listing.location}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center">
                                <span className="text-sm font-semibold text-blue-700">
                                  ${listing.price.toLocaleString()}
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  {listing.type}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No properties found. Try different search terms.
                        </div>
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    {searchResults.length > 0 && (
                      <div className="sticky bottom-0 bg-white p-3 border-t">
                        <Link
                          href={`/listings?search=${encodeURIComponent(
                            searchQuery
                          )}${selectedCity ? `&city=${selectedCity}` : ""}${
                            selectedType ? `&type=${selectedType}` : ""
                          }${selectedPrice ? `&price=${selectedPrice}` : ""}`}
                          className="flex justify-center items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setShowSearchResults(false)}
                        >
                          View all matching properties
                          <FontAwesomeIcon icon={faArrowRight} size="sm" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand Filters Button */}
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="hidden md:flex items-center justify-center h-14 px-4 bg-white rounded-xl shadow-md text-gray-700 hover:bg-gray-50"
                >
                  <span>More Filters</span>
                  <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                </button>
              )}

              {/* Advanced Filters (shown when expanded) */}
              {isExpanded && (
                <>
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-14 pl-5 pr-10 text-base rounded-xl appearance-none border-0 bg-white shadow-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">All Cities</option>
                      <option>Addis Ababa</option>
                      <option>Adama</option>
                      <option>Bahirdar</option>
                      <option>Hawassa</option>
                      <option>Jigjiga</option>
                      <option>Negele</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full h-14 pl-5 pr-10 text-base rounded-xl appearance-none border-0 bg-white shadow-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">All Types</option>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Villa</option>
                      <option>Penthouse</option>
                      <option>Mansion</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-full h-14 pl-5 pr-10 text-base rounded-xl appearance-none border-0 bg-white shadow-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">All Prices</option>
                      <option>$0 - $1,000,000</option>
                      <option>$1,000,000 - $5,000,000</option>
                      <option>$5,000,000 - $10,000,000</option>
                      <option>$10,000,000 - $20,000,000</option>
                      <option>$20,000,000+</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Search Button */}
              <div className="flex flex-col md:flex-row gap-3">
                {isExpanded && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-center h-14 px-4 bg-gray-100 rounded-xl shadow-md text-gray-700 hover:bg-gray-200"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    <span>Less</span>
                  </button>
                )}
                <Link href={"/listings"} className="flex-1">
                  <button className="w-full h-14 flex items-center justify-center gap-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Search Properties</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden">
          <div className="bg-white w-full max-h-[85vh] rounded-t-3xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">All Cities</option>
                  <option>Addis Ababa</option>
                  <option>Adama</option>
                  <option>Bahirdar</option>
                  <option>Hawassa</option>
                  <option>Jigjiga</option>
                  <option>Negele</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">All Types</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>Penthouse</option>
                  <option>Mansion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">All Prices</option>
                  <option>$0 - $1,000,000</option>
                  <option>$1,000,000 - $5,000,000</option>
                  <option>$5,000,000 - $10,000,000</option>
                  <option>$10,000,000 - $20,000,000</option>
                  <option>$20,000,000+</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCity("");
                    setSelectedType("");
                    setSelectedPrice("");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-100 rounded-lg text-gray-800 font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 px-4 bg-blue-600 rounded-lg text-white font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Listings */}
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
      <WhyChooseUs />
      <MainTestimonial />
      <FeaturedCities />
      <CTA />
      <Footer />
    </div>
  );
}
