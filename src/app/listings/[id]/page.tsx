"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBath,
  faCheck,
  faX,
  faChevronRight,
  faVectorSquare,
  faCalendarAlt,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import AppointmentForm from "@/components/user/AppointmentForm";
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
  overview: string;
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
  const router = useRouter();
  const numericId = parseInt(id as string);
  const [activeTab, setActiveTab] = useState<"overview" | "features">(
    "overview"
  );

  // 1. Fetch ALL listings (using your exact hook)
  const { data: allListings = [], isLoading } =
    useFirestoreCollection<Listing>("listings");

  // 2. Find our specific listing
  const listing = allListings.find((l) => l.numericId === numericId);

  // 3. Get similar listings
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (listing) {
      setLoadingSimilar(true);
      const getSimilar = async () => {
        try {
          const cityTarget = "addis ababa";
          const similar = allListings
            .filter(
              (l) =>
                l.location.toLowerCase().includes(cityTarget) &&
                l.numericId !== numericId &&
                l.status === "available"
            )
            .sort((a, b) => b.numericId - a.numericId)
            .slice(0, 4);
          setSimilarListings(similar);
        } catch (error) {
          console.error("Error finding similar listings:", error);
        } finally {
          setLoadingSimilar(false);
        }
      };
      getSimilar();
    }
  }, [listing, allListings, numericId]);

  // Helper functions (unchanged)
  const getSearchTerms = (location?: string) => {
    if (!location) return [];
    const parts = location
      .toLowerCase()
      .replace(/[^a-z ]/g, "")
      .split(" ");
    return parts.length > 1
      ? [`${parts[0]} ${parts[1]}, parts[0], parts[1]`]
      : [parts[0]];
  };

  const year = listing?.createdAt?.toDate?.()?.getFullYear?.() || "N/A";

  // Loading and error states (unchanged)
  if (isLoading) {
    return <PageLoader />;
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Listing not found</h1>
        <Button
          onClick={() => router.push("/listings")}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Browse Available Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl bg-gray-50 mx-auto px-4 py-18 space-y-8">
      {/* Breadcrumb */}
      <nav className="font-light flex items-center text-gray-600 my-5 space-x-2">
        <button
          onClick={() => router.push("/")}
          className="hover:text-blue-700"
        >
          Home
        </button>
        <FontAwesomeIcon icon={faChevronRight} className="w-2" />
        <button
          onClick={() => router.push("/listings")}
          className="hover:text-blue-700"
        >
          Properties
        </button>
        <FontAwesomeIcon icon={faChevronRight} className="w-2" />
        <span className="text-blue-700 font-normal">{listing.title}</span>
      </nav>

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

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            {/* Title and Price */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="">
                <h1 className="text-3xl font-bold text-gray-900">
                  {listing.title}
                </h1>
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="w-3 h-3 mr-1 text-blue-700"
                />
                <span className="truncate text-gray-600">
                  {listing.location}
                </span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-700">
                  ETB{" "}
                  {Number(listing.price).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
                {listing.for === "Rent" ? (
                  <p className="text-sm text-gray-500">
                    {Number(listing.price).toLocaleString("en-US")}/month
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    ETB{" "}
                    {Number((listing.price / 12).toFixed(1)).toLocaleString()}
                    /mo est.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faBed}
                  className="text-blue-700 w-5 h-5"
                />
                <div>
                  <p className="text-gray-500 text-sm">Bedrooms</p>
                  <p className="font-semibold">{listing.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faBath}
                  className="text-blue-700 w-5 h-5"
                />
                <div>
                  <p className="text-gray-500 text-sm">Bathrooms</p>
                  <p className="font-semibold">{listing.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faVectorSquare}
                  className="text-blue-700 w-5 h-5"
                />
                <div>
                  <p className="text-gray-500 text-sm">Area</p>
                  <p className="font-semibold">{listing.area} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-blue-700 w-5 h-5"
                />
                <div>
                  <p className="text-gray-500 text-sm">Year Built</p>
                  <p className="font-semibold">{year}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "features"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Features
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === "overview" ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {listing.overview || "No overview provided."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featureOptions.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      {listing.amenities?.includes(feature) ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-green-500 w-4 h-4 mt-0.5"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faX}
                          className="text-red-400 w-4 h-4 mt-0.5"
                        />
                      )}
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-8 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Similar Properties</h3>
            {loadingSimilar ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-lg overflow-hidden flex"
                  >
                    <div className="w-1/3 h-32 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-2 w-2/3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : similarListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarListings.map((property) => (
                  <div
                    key={property.id}
                    className="border rounded-lg overflow-hidden flex transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/listings/${property.numericId}`)
                    }
                  >
                    {/* Left: Image */}
                    <div className="relative w-1/3 h-30 bg-gray-100">
                      {property.images?.[0] ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Info */}
                    <div className="w-2/3 p-4 space-y-1">
                      <h4 className="font-semibold text-base text-gray-800 truncate">
                        {property.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="w-3 h-3 mr-1 text-blue-700"
                        />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <p className="font-bold text-blue-700 text-sm">
                        ETB{" "}
                        {Number(property.price).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600">
                  No similar properties found for{" "}
                  <span className="font-medium">{listing?.location}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Searched for: {getSearchTerms(listing?.location).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Contact */}
        <div className="space-y-6">
          {/* Agent Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src="/My-profilepic.jpg"
                  alt="Property agent"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">Shueb Ahmed</h3>
                <p className="text-sm text-gray-500">
                  Senior Property Consultant
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-4 h-4 text-blue-700"
                />
                <span>+251 991 868 812</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-4 h-4 text-blue-700"
                />
                <span>shukang@ethioaddis.com</span>
              </div>
            </div>
            <Button
              className="w-full mt-6 bg-blue-700 hover:bg-blue-600"
              onClick={() => window.open("https://t.me/ShuebAhmed", "_blank")}
            >
              Contact Agent
            </Button>
          </div>
          {/* Appointment Form */}
          <AppointmentForm
            listingTitle={listing.title}
            numericId={listing.numericId}
            listingImage={listing.images?.[0]}
          />

          {/* Location Map Placeholder */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3">Location</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map coming soon</p>
            </div>
            <p className="mt-3 text-sm text-gray-600 flex items-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="w-4 h-4 mr-2 text-blue-700"
              />
              {listing.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
