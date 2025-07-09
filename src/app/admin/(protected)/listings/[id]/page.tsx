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
} from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/PageLoader";
import { Loader2 } from "lucide-react";
import { faTypo3 } from "@fortawesome/free-brands-svg-icons";

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
  createdBy: string;
  createdAt: any;
  status: string;
  bedrooms: string;
  bathrooms: string;
  type: string;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [createdByName, setCreatedByName] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("Admin");

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
      if (listingData.createdBy) {
        const adminRef = doc(db, "admins", listingData.createdBy);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          setAdminName(`${adminData.firstName} ${adminData.lastName}`);
        }
      }
    };

    fetchListing();
  }, [id]);
  useEffect(() => {
    const fetchAdminName = async () => {
      if (!listing?.createdBy) return;

      const q = query(
        collection(db, "admins"),
        where("email", "==", listing.createdBy)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const admin = snap.docs[0].data();
        setCreatedByName(`${admin.firstName} ${admin.lastName}`);
      } else {
        setCreatedByName(listing.createdBy);
      }
    };

    fetchAdminName();
  }, [listing?.createdBy]);

  if (!listing) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto p-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-blue-600 w-4" />
          <p className="text-sm flex items-center">
            Created by: {""}{" "}
            <span className="font-medium text-blue-700">
              {createdByName || (
                <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
              )}
            </span>
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
              listing.status === "sold" ? "text-red-500" : "text-green-600"
            }`}
          />
          <span>
            Status:{" "}
            <strong
              className={
                listing.status === "sold" ? "text-red-600" : "text-green-600"
              }
            >
              {listing.status?.toUpperCase()}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex gap-4 h-[500px]">
        {/* Main Image */}
        <div className="w-1/2 rounded-lg overflow-hidden relative">
          <Image
            src={listing.images?.[0] || "/no-image.jpg"}
            alt={listing.title}
            width={1000}
            height={500}
            className="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Right Side Gallery Images */}
        {listing.images?.length > 1 && (
          <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-4 overflow-hidden rounded-lg">
            {listing.images.slice(1, 5).map((img, i) => (
              <div key={i} className="rounded-lg overflow-hidden h-full">
                <Image
                  src={img}
                  alt={`Gallery image ${i + 2}`}
                  width={500}
                  height={250}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Listing Header Details */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mt-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{listing.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{listing.location}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-2xl font-bold text-blue-700">
            ETB {Number(listing.price).toLocaleString("en-US")}
          </p>
          <p className="text-sm text-gray-500">
            Est. {Number(listing.price / 12).toLocaleString("en-US")} / month
          </p>
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
