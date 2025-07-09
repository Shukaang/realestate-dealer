"use client";

import { useState, useEffect } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import PropertyCard from "@/components/user/PropertyCard";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThLarge } from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/PageLoader";

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
export default function ListingsPage() {
  const { data: listings = [] } = useFirestoreCollection<any>("listings");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredListings = listings
    .filter((l) => l.status !== "sold")
    .filter((l) => {
      const query = searchQuery.toLowerCase();
      return (
        l.title?.toLowerCase().includes(query) ||
        l.location?.toLowerCase().includes(query)
      );
    })
    .filter((l) =>
      selectedCity
        ? l.location?.toLowerCase().includes(selectedCity.toLowerCase())
        : true
    )
    .filter((l) =>
      selectedType ? l.type?.toLowerCase() === selectedType.toLowerCase() : true
    )
    .filter((l) => {
      if (!selectedPrice) return true;
      const price = Number(l.price);
      const [min, max] = selectedPrice
        .split("-")
        .map((p) => Number(p.replace(/[^\d]/g, "")));
      return max ? price >= min && price <= max : price >= min;
    })
    .sort((a, b) => {
      const dateA =
        typeof a.createdAt?.toDate === "function"
          ? a.createdAt.toDate()
          : new Date(a.createdAt);

      const dateB =
        typeof b.createdAt?.toDate === "function"
          ? b.createdAt.toDate()
          : new Date(b.createdAt);

      return dateB.getTime() - dateA.getTime();
    });

  const listingsPerPage = 12;
  const indexOfLast = currentPage * listingsPerPage;
  const indexOfFirst = indexOfLast - listingsPerPage;
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  const currentListings = filteredListings.slice(indexOfFirst, indexOfLast);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const allListings = filteredListings.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType, selectedPrice]);

  const { data, isLoading } = useFirestoreCollection<Listing>("listings");
  if (isLoading) return <PageLoader />;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative mx-5 h-[350px] flex items-center justify-center bg-black text-white">
        <Image
          src="/Big Home1.jpg"
          fill
          alt="Hero Image"
          className="object-cover opacity-80"
        />
        <div className="z-10 text-center space-y-2 px-4">
          <h1 className="text-4xl font-bold mb-4">Explore Properties</h1>
          <p className="text-lg text-gray-300">
            Find your dream home in the city you love.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white shadow sticky top-15 z-40 py-4">
        <div className="container mx-auto px-4 flex flex-wrap gap-4 justify-between items-center">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or location..."
            className="border px-3 py-2 rounded-md w-full md:w-1/4"
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border px-3 py-2 text-sm rounded-md"
          >
            <option value="">All Cities</option>
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
            className="border px-3 py-2 text-sm rounded-md"
          >
            <option value="">All Types</option>
            <option>Apartment</option>
            <option>House</option>
            <option>Villa</option>
          </select>
          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="border px-3 py-2 text-sm rounded-md"
          >
            <option value="">All Prices</option>
            <option value="0-1000000">Up to 1M</option>
            <option value="1000000-5000000">1M - 5M</option>
            <option value="5000000-10000000">5M - 10M</option>
            <option value="10000000">10M+</option>
          </select>

          <div className="flex gap-2 mb-4">
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
              className={`px-2 py-1 rounded ${
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

      {/* Results */}
      <section className="container mx-auto px-4 py-10">
        <h3 className="text-gray-500 mb-4">
          Showing{" "}
          {filteredListings.length > 0 ? `1-${filteredListings.length}` : "0"}{" "}
          of {allListings} Properties
        </h3>
        {filteredListings.length === 0 ? (
          <p className="text-center text-gray-500">
            No properties match your filters.
          </p>
        ) : (
          <div
            className={`${
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }`}
          >
            {currentListings.map((listing) => (
              <PropertyCard key={listing.id} property={listing} view={view} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 rounded ${
              number === currentPage
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}
