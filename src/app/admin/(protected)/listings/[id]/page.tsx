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
  faMapMarkerAlt,
  faCheck,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/page-loader";

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
  amenities?: string[];
  for: string;
}

const featureOptions = [
  "Central Air Conditioning",
  "Gourmet Kitchen",
  "Smart Home Technology",
  "Fitness Center Access",
  "24/7 Security",
  "Laundry Room",
  "Hardwood Flooring",
  "Private Balcony",
  "Swimming Pool",
  "Garage Parking",
  "High Ceilings",
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "features">(
    "overview"
  );

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
    };

    fetchListing();
  }, [id]);

  if (!listing) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Meta info row */}
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
              className="object-cover"
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
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Listing Header Details */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{listing.title}</h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-blue-600 mr-2"
            />
            {listing.location}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg min-w-[250px]">
          <p className="text-2xl font-bold text-blue-700">
            ETB {Number(listing.price).toLocaleString("en-US")}
          </p>
          {listing.for === "Rent" ? (
            <p className="text-sm text-gray-500">
              {Number(listing.price).toLocaleString("en-US")}/month
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Est. {Number(listing.price / 12).toLocaleString("en-US")}/month
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faVectorSquare}
              className="text-blue-600 w-4"
            />
            <div>
              <p className="text-gray-500 text-sm">Area</p>
              <p className="font-semibold">{listing.area} m²</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBed} className="text-blue-600 w-4" />
            <div>
              <p className="text-gray-500 text-sm">Bedrooms</p>
              <p className="font-semibold">{listing.bedrooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBath} className="text-blue-600 w-4" />
            <div>
              <p className="text-gray-500 text-sm">Bathrooms</p>
              <p className="font-semibold">{listing.bathrooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faHouse} className="text-blue-600 w-4" />
            <div>
              <p className="text-gray-500 text-sm">Type</p>
              <p className="font-semibold capitalize">{listing.type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Left Column - Tabs Content */}
        <div className="lg:w-2/3 p-4 rounded-lg shadow-sm border border-gray-100">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "features"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Features & Amenities
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === "overview" ? (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Property Overview
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {listing.overview || "No overview provided."}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featureOptions.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      {listing.amenities?.includes(feature) ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-green-500 w-4 h-4"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faX}
                          className="text-red-400 w-4 h-4"
                        />
                      )}
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Description */}
        <div className="lg:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Property Description
            </h2>
            <div className="prose prose-sm text-gray-600">
              <p className="whitespace-pre-line leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
