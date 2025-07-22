"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarAlt,
  faCircleXmark,
  faCircleCheck,
  faVectorSquare,
  faBed,
  faBath,
  faHouse,
  faLocation,
  faMapMarker,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/PageLoader";

interface Listing {
  id: string;
  area: string;
  numericId: number;
  title: string;
  location: string;
  price: number;
  description?: string;
  overview: string;
  images?: string[];
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: any;
  status: string;
  bedrooms: string;
  bathrooms: string;
  type: string;
  for: string;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [createdByName, setCreatedByName] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const numericId = parseInt(id as string);
      if (isNaN(numericId)) return;

      const q = query(
        collection(db, "listings"),
        where("numericId", "==", numericId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;

      const docSnap = snap.docs[0];
      const listingData = { id: docSnap.id, ...docSnap.data() } as Listing;

      setListing(listingData);

      // Fetch admin who created the listing
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-18 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-blue-600 w-4" />
          <p className="text-sm font-semibold flex items-center">
            {"By: "}
            {listing.createdBy?.name || "Unknown creator"}{" "}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 w-4" />
          <span>
            Created on:{" "}
            <strong>
              {listing.createdAt?.toDate?.().toLocaleDateString?.() || "N/A"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={listing.status === "sold" ? faCircleXmark : faCircleCheck}
            className={`w-4 ${
              listing.status === "sold"
                ? "text-red-500"
                : listing.status === "available"
                ? "text-green-600"
                : "text-yellow-500"
            }`}
          />
          <span>
            Status:{" "}
            <strong
              className={
                listing.status === "sold"
                  ? "text-red-600"
                  : listing.status === "available"
                  ? "text-green-600"
                  : "text-yellow-500"
              }
            >
              {listing.status?.toUpperCase()}
            </strong>
          </span>
        </div>
      </div>

      {/* Property Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
        <div className="relative rounded-xl overflow-hidden h-full">
          {listing.images?.[0] && (
            <Image
              src={listing.images[0]}
              alt={`Main view of ${listing.title}`}
              fill
              className="object-cover lg:object-cover sm:object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
          {listing.images?.slice(1, 5).map((img, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden">
              <Image
                src={img}
                alt={`Gallery image ${i + 1} of ${listing.title}`}
                fill
                className="object-cover lg:object-cover sm:object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Listing Header Details */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mt-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100">
            {listing.title}
          </h1>

          <p className="text-gray-500 mt-1">
            <span className="text-blue-600 mr-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </span>
            {listing.location}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-2xl font-bold text-blue-700">
            ETB {Number(listing.price).toLocaleString("en-US")}
          </p>
          {listing.for === "Rent" ? (
            <p className="text-sm text-gray-500">
              {Number(listing.price).toLocaleString("en-US")}/month
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Est. {Number(listing.price / 12).toLocaleString("en-US")} / month
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="border p-4 rounded shadow text-center">
          <div className="flex items-center justify-center gap-3">
            <p className="text-blue-600">
              <FontAwesomeIcon icon={faVectorSquare} />
            </p>
            <p className="text-gray-500 mb-1">Area</p>
          </div>
          <p className="font-semibold">{listing.area} m²</p>
        </div>
        <div className="border p-4 rounded shadow text-center">
          <div className="flex items-center justify-center gap-3">
            <p className="text-blue-600">
              <FontAwesomeIcon icon={faBed} />
            </p>
            <p className="text-gray-500 mb-1">Bedrooms</p>
          </div>
          <p className="font-semibold">{listing.bedrooms}</p>
        </div>
        <div className="border p-4 rounded shadow text-center">
          <div className="flex items-center justify-center gap-3">
            <p className="text-blue-600">
              <FontAwesomeIcon icon={faBath} />
            </p>
            <p className="text-gray-500 mb-1">Bathrooms</p>
          </div>
          <p className="font-semibold">{listing.bathrooms}</p>
        </div>
        <div className="border p-4 rounded shadow text-center">
          <div className="flex items-center justify-center gap-3">
            <p className="text-blue-600">
              <FontAwesomeIcon icon={faHouse} />
            </p>
            <p className="text-gray-500 mb-1">Type</p>
          </div>
          <p className="font-semibold capitalize">{listing.type}</p>
        </div>
      </div>

      {/* Overview + Description */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Overview (2/3) */}
        <div className="lg:w-2/3 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">Full Overview</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.overview || "No overview provided."}
          </p>
        </div>

        {/* Description (1/3) */}
        <div className="lg:w-1/3 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">
            Property Description
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}
