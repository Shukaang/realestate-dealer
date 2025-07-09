"use client";

import Link from "next/link";
import { useState } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, CornerUpLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { doc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import PageLoader from "@/components/shared/PageLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faHouse,
  faVectorSquare,
  faList,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";

interface Listing {
  id: string;
  numericId: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  images?: string[];
  createdAt: any;
  createdBy: string;
}

export default function ListingsPage() {
  const {
    data: allListings = [],
    isLoading,
    mutate,
  } = useFirestoreCollection<Listing>("listings");

  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  // Sort newest first by createdAt
  const sortedListings = allListings.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter by status
  const filteredListings = sortedListings
    .filter((listing) =>
      filter === "All" ? true : listing.status === filter.toLowerCase()
    )
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

  // Handlers for delete and status update (same as your existing logic)
  async function handleDelete(id: string, imageUrl?: string) {
    try {
      await deleteDoc(doc(db, "listings", id));
      if (imageUrl) await deleteObject(ref(storage, imageUrl));
      toast.success("Listing deleted");
      mutate();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleMarkAsSold(id: string) {
    try {
      await updateDoc(doc(db, "listings", id), { status: "sold" });
      toast.success("Marked as Sold");
      mutate();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleMarkAsAvailable(id: string) {
    try {
      await updateDoc(doc(db, "listings", id), { status: "available" });
      toast.success("Marked as Available");
      mutate();
    } catch {
      toast.error("Failed to update");
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 md:p-10">
      <div className="flex gap-3 mb-6">
        <FontAwesomeIcon icon={faHouse} className="text-blue-600 text-3xl" />
        <h1 className="text-3xl font-bold">All Listings</h1>
        <h2 className="text-3xl text-blue-600 font-bold">
          {allListings.length}
        </h2>
      </div>
      {/* Filters */}
      <section className="bg-slate-50 dark:bg-blue-950 dark:text-gray-200 shadow-sm rounded mb-5 py-4">
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
            className="border px-3 py-2 text-sm rounded-md dark:text-white"
          >
            <option className="dark:bg-slate-700 dark:text-white" value="">
              All Cities
            </option>
            <option className="dark:bg-slate-700 dark:text-white">Adama</option>
            <option className="dark:bg-slate-700 dark:text-white">
              Addis Ababa
            </option>
            <option className="dark:bg-slate-700 dark:text-white">
              Bahirdar
            </option>
            <option className="dark:bg-slate-700 dark:text-white">
              Hawassa
            </option>
            <option className="dark:bg-slate-700 dark:text-white">
              Jigjiga
            </option>
            <option className="dark:bg-slate-700 dark:text-white">
              Negele
            </option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border px-3 py-2 text-sm rounded-md dark:text-white"
          >
            <option className="dark:bg-slate-700 dark:text-white" value="">
              All Types
            </option>
            <option className="dark:bg-slate-700 dark:text-white">
              Apartment
            </option>
            <option className="dark:bg-slate-700 dark:text-white">House</option>
            <option className="dark:bg-slate-700 dark:text-white">Villa</option>
          </select>
          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="border px-3 py-2 text-sm rounded-md dark:text-white"
          >
            <option className="dark:bg-slate-700 dark:text-white" value="">
              All Prices
            </option>
            <option
              className="dark:bg-slate-700 dark:text-white"
              value="0-1000000"
            >
              Up to 1M
            </option>
            <option
              className="dark:bg-slate-700 dark:text-white"
              value="1000000-5000000"
            >
              1M - 5M
            </option>
            <option
              className="dark:bg-slate-700 dark:text-white"
              value="5000000-10000000"
            >
              5M - 10M
            </option>
            <option
              className="dark:bg-slate-700 dark:text-white"
              value="10000000"
            >
              10M+
            </option>
          </select>
        </div>
      </section>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 border px-4 py-2 bg-slate-50 dark:bg-blue-950 dark:text-white rounded-md"
      >
        <option className="dark:bg-slate-700 dark:text-white" value="All">
          All
        </option>
        <option className="dark:bg-slate-700 dark:text-white" value="Available">
          Available
        </option>
        <option className="dark:bg-slate-700 dark:text-white" value="Sold">
          Sold
        </option>
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings
          .filter((l) => l.createdAt?.toDate)
          .sort(
            (a, b) =>
              b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          )
          .map((listing) => (
            <div
              key={listing.id}
              className="border rounded-xl shadow hover:shadow-lg transition"
            >
              {listing.images?.[0] && (
                <div className="relative">
                  <Link href={`/admin/listings/${listing.numericId}`}>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-56 object-cover rounded-t-xl"
                    />
                  </Link>
                  <Badge className="absolute top-2 right-3 bg-gray-400/70">
                    {listing.type}
                  </Badge>
                </div>
              )}

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-semibold truncate">
                    #{listing.numericId} {listing.title}
                  </h2>

                  <Badge
                    className={
                      listing.status === "sold" ? "bg-red-500" : "bg-green-500"
                    }
                  >
                    {listing.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">{listing.location}</p>
                <p className="text-blue-600 font-bold">
                  ETB {parseInt(listing.price).toLocaleString()}
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>
                    <FontAwesomeIcon icon={faBed} className="text-blue-600" />{" "}
                    {listing.bedrooms}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faBath} className="text-blue-600" />{" "}
                    {listing.bathrooms}
                  </span>
                  <span>
                    <FontAwesomeIcon
                      icon={faVectorSquare}
                      className="text-blue-600"
                    />{" "}
                    {listing.area} m²
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  {listing.createdAt.toDate().toLocaleDateString()} | {"By: "}
                  {listing.createdBy}
                </div>

                <div className="flex gap-3 mt-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/admin/listings/${listing.numericId}/edit`}
                        >
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(listing.id, listing.images?.[0])
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>

                    {listing.status === "available" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsSold(listing.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as Sold</TooltipContent>
                      </Tooltip>
                    )}

                    {listing.status === "sold" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsAvailable(listing.id)}
                          >
                            <CornerUpLeft className="w-4 h-4 text-yellow-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark as Available</TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
