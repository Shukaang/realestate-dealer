"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PropertyCard from "@/components/user/property-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faList, faThLarge } from "@fortawesome/free-solid-svg-icons";
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
  type?: string;
  status?: string;
  for?: string;
  createdAt: any;
}

export default function AllListings() {
  const { data: listings } = useFirestoreCollection<Listing>("listings");
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

  // STEP 1: Filter the listings (exclude sold/pending)
  const filteredListings = listings
    .filter((listing) => {
      // Filter out sold and pending listings
      return listing.status !== "sold" && listing.status !== "pending";
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
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
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
                  key={`${listing.id}-${currentPage}`} // Unique key with page info
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
