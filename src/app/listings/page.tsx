"use client";

import { useState, useEffect, useMemo } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PropertyCard from "@/components/user/property-card";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faList,
  faThLarge,
  faFilter,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/page-loader";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default function ListingsPage() {
  const { data: listings = [], isLoading } =
    useFirestoreCollection<Listing>("listings");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);

  // Initialize filters from URL parameters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || ""
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || ""
  );
  const [selectedPrice, setSelectedPrice] = useState(
    searchParams.get("price") || ""
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") || ""
  );
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Function to update URL with current filter state
  const updateURL = (filters: {
    search?: string;
    city?: string;
    type?: string;
    price?: string;
    bedrooms?: string;
    bathrooms?: string;
    area?: string;
  }) => {
    const params = new URLSearchParams();

    // Add non-empty parameters
    if (filters.search) params.set("search", filters.search);
    if (filters.city) params.set("city", filters.city);
    if (filters.type) params.set("type", filters.type);
    if (filters.price) params.set("price", filters.price);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
    if (filters.area) params.set("area", filters.area);

    // Update URL without page reload
    const newUrl = params.toString()
      ? `/listings?${params.toString()}`
      : "/listings";
    router.push(newUrl, { scroll: false });
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL({
      search: value,
      city: selectedCity,
      type: selectedType,
      price: selectedPrice,
      bedrooms,
      bathrooms,
      area,
    });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    updateURL({
      search: searchQuery,
      city: value,
      type: selectedType,
      price: selectedPrice,
      bedrooms,
      bathrooms,
      area,
    });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: value,
      price: selectedPrice,
      bedrooms,
      bathrooms,
      area,
    });
  };

  const handlePriceChange = (value: string) => {
    setSelectedPrice(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: selectedType,
      price: value,
      bedrooms,
      bathrooms,
      area,
    });
  };

  const handleBedroomsChange = (value: string) => {
    setBedrooms(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: selectedType,
      price: selectedPrice,
      bedrooms: value,
      bathrooms,
      area,
    });
  };

  const handleBathroomsChange = (value: string) => {
    setBathrooms(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: selectedType,
      price: selectedPrice,
      bedrooms,
      bathrooms: value,
      area,
    });
  };

  const handleAreaChange = (value: string) => {
    setArea(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: selectedType,
      price: selectedPrice,
      bedrooms,
      bathrooms,
      area: value,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedType("");
    setSelectedPrice("");
    setBedrooms("");
    setBathrooms("");
    setArea("");
    updateURL({});
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCity = searchParams.get("city") || "";
    const urlType = searchParams.get("type") || "";
    const urlPrice = searchParams.get("price") || "";
    const urlBedrooms = searchParams.get("bedrooms") || "";
    const urlBathrooms = searchParams.get("bathrooms") || "";
    const urlArea = searchParams.get("area") || "";

    setSearchQuery(urlSearch);
    setSelectedCity(urlCity);
    setSelectedType(urlType);
    setSelectedPrice(urlPrice);
    setBedrooms(urlBedrooms);
    setBathrooms(urlBathrooms);
    setArea(urlArea);
  }, [searchParams]);

  // Memoized filter application (similar to HomePage)
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.status === "available")
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
          if (selectedPrice === "0-1000000") return price < 1_000_000;
          if (selectedPrice === "1000000-5000000")
            return price >= 1_000_000 && price < 5_000_000;
          if (selectedPrice === "5000000-10000000")
            return price >= 5_000_000 && price < 10_000_000;
          if (selectedPrice === "10000000") return price >= 10_000_000;
          return true;
        })();

        const matchesBedrooms = bedrooms
          ? l.bedrooms >= parseInt(bedrooms)
          : true;

        const matchesBathrooms = bathrooms
          ? l.bathrooms >= parseInt(bathrooms)
          : true;

        const matchesArea = area ? l.area >= parseInt(area) : true;

        return (
          matchesSearch &&
          matchesCity &&
          matchesType &&
          matchesPrice &&
          matchesBedrooms &&
          matchesBathrooms &&
          matchesArea
        );
      })
      .sort((a, b) => {
        const numericIdA = Number(a.numericId) || 0;
        const numericIdB = Number(b.numericId) || 0;
        return numericIdB - numericIdA;
      });
  }, [
    listings,
    searchQuery,
    selectedCity,
    selectedType,
    selectedPrice,
    bedrooms,
    bathrooms,
    area,
  ]);

  // Pagination calculations
  const LISTINGS_PER_PAGE = 9;
  const totalListings = filteredListings.length;
  const totalPages = Math.ceil(totalListings / LISTINGS_PER_PAGE);

  // Get current page listings
  const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
  const endIndex = startIndex + LISTINGS_PER_PAGE;
  const currentPageListings = filteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCity,
    selectedType,
    selectedPrice,
    bedrooms,
    bathrooms,
    area,
  ]);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Check if any filters are active
  const hasFilters =
    searchQuery ||
    selectedCity ||
    selectedType ||
    selectedPrice ||
    bedrooms ||
    bathrooms ||
    area;

  if (isLoading) return <PageLoader />;

  return (
    <section>
      <div className="py-18">
        {/* Hero Section */}
        <section className="relative h-[350px] flex items-center justify-center bg-black text-gray-50">
          <Image
            src="/the-new-hero.jpg"
            fill
            alt="Hero Image"
            className="object-cover w-fit h-fit opacity-80"
          />
          <div className="z-10 text-center space-y-2 px-4">
            <h1 className="text-4xl font-bold mb-4">Explore Our Properties</h1>
            <p className="text-lg text-gray-200">
              Find your dream home in the city you love.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white shadow sm:sticky sm:top-15 sm:z-40 py-4">
          <div className="container mx-auto px-4">
            {/* Filter Summary Bar */}
            {hasFilters && (
              <div className="flex flex-wrap justify-between items-center gap-2 text-sm text-white bg-blue-800/80 px-4 py-2 rounded-lg mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {searchQuery && (
                    <FilterChip
                      label={`Search: "${searchQuery}"`}
                      onRemove={() => handleSearchChange("")}
                    />
                  )}
                  {selectedCity && (
                    <FilterChip
                      label={`City: ${selectedCity}`}
                      onRemove={() => handleCityChange("")}
                    />
                  )}
                  {selectedType && (
                    <FilterChip
                      label={`Type: ${selectedType}`}
                      onRemove={() => handleTypeChange("")}
                    />
                  )}
                  {selectedPrice && (
                    <FilterChip
                      label={`Price: ${
                        selectedPrice === "0-1000000"
                          ? "Up to 1M"
                          : selectedPrice === "1000000-5000000"
                          ? "1M - 5M"
                          : selectedPrice === "5000000-10000000"
                          ? "5M - 10M"
                          : "10M+"
                      }`}
                      onRemove={() => handlePriceChange("")}
                    />
                  )}
                  {bedrooms && (
                    <FilterChip
                      label={`Bedrooms: ${bedrooms}+`}
                      onRemove={() => handleBedroomsChange("")}
                    />
                  )}
                  {bathrooms && (
                    <FilterChip
                      label={`Bathrooms: ${bathrooms}+`}
                      onRemove={() => handleBathroomsChange("")}
                    />
                  )}
                  {area && (
                    <FilterChip
                      label={`Area: ${area}+ m²`}
                      onRemove={() => handleAreaChange("")}
                    />
                  )}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-0.5 hover:text-white/70 cursor-pointer text-sm"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-between items-center">
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by title or location..."
                className="border px-3 py-2 rounded-md w-full md:w-1/4"
              />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="border px-3 py-2 text-sm rounded-md"
              >
                <option value="">All Cities</option>
                <option value="Adama">Adama</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Bahirdar">Bahirdar</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Jigjiga">Jigjiga</option>
                <option value="Negele">Negele</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="border px-3 py-2 text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
              </select>
              <select
                value={selectedPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="border px-3 py-2 text-sm rounded-md"
              >
                <option value="">All Prices</option>
                <option value="0-1000000">Up to 1M</option>
                <option value="1000000-5000000">1M - 5M</option>
                <option value="5000000-10000000">5M - 10M</option>
                <option value="10000000">10M+</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex justify-between items-center text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md border bg-gray-50 border-gray-300"
              >
                <FontAwesomeIcon icon={faFilter} size="xs" />
                {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setView("grid")}
                  className={`px-2 py-1 rounded ${
                    view === "grid"
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`hidden sm:block px-2 py-1 rounded ${
                    view === "list"
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faList} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 p-4 rounded-lg mt-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => handleBedroomsChange(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border bg-white border-gray-300 text-black focus:ring-0 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => handleBathroomsChange(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border bg-white border-gray-300 text-black focus:ring-0 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Area (m²)
                  </label>
                  <select
                    value={area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border bg-white border-gray-300 text-black focus:ring-0 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="100">100+</option>
                    <option value="200">200+</option>
                    <option value="300">300+</option>
                    <option value="500">500+</option>
                    <option value="1000">1000+</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-4 py-10">
          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="container mx-auto px-4 mb-6">
              <div className="flex justify-center items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                          pageNumber === currentPage
                            ? "bg-blue-700 text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-gray-600 text-lg hidden sm:block">
                Showing {totalListings === 0 ? 0 : startIndex + 1}-
                {Math.min(endIndex, totalListings)} of {totalListings}{" "}
                Properties
              </h3>
              {totalPages > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  Page {currentPage} of {totalPages} •{" "}
                  {currentPageListings.length} listings on this page
                </p>
              )}
            </div>
          </div>

          {/* Listings Display */}
          {totalListings === 0 ? (
            <div className="text-center py-16">
              <div className="text-blue-700 text-6xl mb-4">
                <FontAwesomeIcon icon={faHome} />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Property Cards - ONLY CURRENT PAGE LISTINGS */}
              <div
                className={`${
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }`}
              >
                {currentPageListings.map((listing) => (
                  <PropertyCard
                    key={`${listing.id}-${currentPage}`}
                    property={listing}
                    view={view}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Bottom Pagination Section */}
        {totalPages > 1 && (
          <div className="container mx-auto px-4 pb-10">
            <div className="flex justify-center items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                        pageNumber === currentPage
                          ? "bg-blue-700 text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 rounded-lg font-medium text-sm transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Page {currentPage} of {totalPages} • {totalListings} total
              properties
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Filter chip component for individual filters
const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1 bg-blue-700/70 px-2 py-1 rounded text-xs whitespace-nowrap">
    <span>{label}</span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="hover:text-blue-200"
    >
      <FontAwesomeIcon icon={faXmark} className="text-xs" />
    </button>
  </div>
);
