"use client";

import { useState, useEffect } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PropertyCard from "@/components/user/property-card";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faList, faThLarge } from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/page-loader";
import { useSearchParams, useRouter } from "next/navigation";

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

  // Function to update URL with current filter state
  const updateURL = (filters: {
    search?: string;
    city?: string;
    type?: string;
    price?: string;
  }) => {
    const params = new URLSearchParams();

    // Add non-empty parameters
    if (filters.search) params.set("search", filters.search);
    if (filters.city) params.set("city", filters.city);
    if (filters.type) params.set("type", filters.type);
    if (filters.price) params.set("price", filters.price);

    // Update URL without page reload
    const newUrl = params.toString()
      ? `/listings?${params.toString()}`
      : "/listings";
    router.push(newUrl, { scroll: false });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL({
      search: value,
      city: selectedCity,
      type: selectedType,
      price: selectedPrice,
    });
  };

  // Handle city filter change
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    updateURL({
      search: searchQuery,
      city: value,
      type: selectedType,
      price: selectedPrice,
    });
  };

  // Handle type filter change
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: value,
      price: selectedPrice,
    });
  };

  // Handle price filter change
  const handlePriceChange = (value: string) => {
    setSelectedPrice(value);
    updateURL({
      search: searchQuery,
      city: selectedCity,
      type: selectedType,
      price: value,
    });
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCity = searchParams.get("city") || "";
    const urlType = searchParams.get("type") || "";
    const urlPrice = searchParams.get("price") || "";

    setSearchQuery(urlSearch);
    setSelectedCity(urlCity);
    setSelectedType(urlType);
    setSelectedPrice(urlPrice);
  }, [searchParams]);

  // STEP 1: Filter the listings (exclude sold/pending)
  const filteredListings = listings
    .filter((listing) => {
      // Filter out sold and pending listings
      return listing.status !== "sold" && listing.status !== "pending";
    })
    .filter((listing) => {
      // Search filter
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        listing.title?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query)
      );
    })
    .filter((listing) => {
      // City filter
      if (!selectedCity) return true;
      return listing.location
        ?.toLowerCase()
        .includes(selectedCity.toLowerCase());
    })
    .filter((listing) => {
      // Type filter
      if (!selectedType) return true;
      return listing.type?.toLowerCase() === selectedType.toLowerCase();
    })
    .filter((listing) => {
      // Price filter
      if (!selectedPrice) return true;
      const price = Number(listing.price);
      const [min, max] = selectedPrice
        .split("-")
        .map((p) => Number(p.replace(/[^\d]/g, "")));
      return max ? price >= min && price <= max : price >= min;
    })
    .sort((a, b) => {
      // Sort by numericId in ascending order (1, 2, 3, 4, 5...)
      const numericIdA = Number(a.numericId) || 0;
      const numericIdB = Number(b.numericId) || 0;
      return numericIdB - numericIdA;
    });

  // STEP 2: Pagination calculations
  const LISTINGS_PER_PAGE = 9;
  const totalListings = filteredListings.length;
  const totalPages = Math.ceil(totalListings / LISTINGS_PER_PAGE);

  // STEP 3: Get current page listings (THIS IS THE KEY PART)
  const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
  const endIndex = startIndex + LISTINGS_PER_PAGE;
  const currentPageListings = filteredListings.slice(startIndex, endIndex);

  // STEP 4: Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType, selectedPrice]);

  // STEP 5: Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative mx-5 h-[350px] flex items-center justify-center bg-black text-gray-50">
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
        <div className="container mx-auto px-4 flex flex-wrap gap-4 justify-between items-center">
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
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-10">
        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="container mx-auto px-4">
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
              {Math.min(endIndex, totalListings)} of {totalListings} Properties
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

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="container mx-auto px-4">
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
          <div className="text-center mt-4 text-sm text-gray-500 animate-on-scroll delay-200">
            Page {currentPage} of {totalPages} • {totalListings} total
            properties
          </div>
        </div>
      )}
    </div>
  );
}
