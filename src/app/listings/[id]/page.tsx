import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";
import AppointmentForm from "@/components/user/AppointmentForm";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBath,
  faVectorSquare,
  faCalendarAlt,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

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
  overview: "";
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Listing #${params.id} | EstateElite`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const numericId = parseInt(params.id);
  if (isNaN(numericId)) return notFound();

  const q = query(
    collection(db, "listings"),
    where("numericId", "==", numericId)
  );

  const snap = await getDocs(q);
  if (snap.empty) return notFound();

  const docSnap = snap.docs[0];
  const listing = { id: docSnap.id, ...docSnap.data() } as Listing;

  const year = listing.createdAt?.toDate?.().getFullYear?.() || "N/A";

  return (
    <div className="max-w-7xl bg-gray-100 mx-auto px-4 py-10 mt-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="font-light font-sans flex items-center text-gray-500 mb-5 mt-8 space-x-2">
        <Link href="/" className="hover:text-blue-700">
          Home
        </Link>
        <FontAwesomeIcon icon={faChevronRight} className="w-2" />
        <Link href="/listings" className="hover:text-blue-700">
          Properties
        </Link>
        <FontAwesomeIcon icon={faChevronRight} className="w-2" />
        <span className="text-blue-700 font-normal">{listing.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-4 lg:h-[500px]">
        {/* First image - left half */}
        <div className="w-full lg:w-1/2 rounded-lg overflow-hidden relative h-[300px] lg:h-full">
          {listing.images && listing.images.length > 0 && (
            <img
              src={listing.images[0]}
              alt="Main property image"
              className="object-cover w-full h-full"
            />
          )}
        </div>

        {/* Right side grid for images 2 to 5 */}
        {(listing.images?.length ?? 0) > 1 && (
          <div className="w-full lg:w-1/2 grid grid-cols-2 grid-rows-2 gap-4 overflow-hidden rounded-lg h-[300px] lg:h-full">
            {listing.images?.slice(1, 5).map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden">
                <img
                  src={img}
                  alt={`Gallery image ${i + 2}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side */}
        <div className="lg:w-2/3 space-y-6">
          {/* Details */}
          <div className="bg-white shadow-md rounded-lg py-6 px-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {listing.title}
              </h1>
              <div>
                <p className="text-3xl font-bold font-sans text-blue-700">
                  ETB {Number(listing.price).toLocaleString("en-US")}
                </p>
                <p className="text-gray-500 text-sm">
                  ETB {Number(listing.price / 12).toLocaleString("en-US")} /mo
                  est.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
              <div className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faBed} className="text-blue-600 w-5" />
                <div>
                  <p className="text-gray-500">Bedrooms</p>
                  <p className="font-semibold">{listing.bedrooms}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faBath} className="text-blue-600 w-5" />
                <div>
                  <p className="text-gray-500">Bathrooms</p>
                  <p className="font-semibold">{listing.bathrooms}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faVectorSquare}
                  className="text-blue-600 w-4"
                />
                <div>
                  <p className="text-gray-500">Area</p>
                  <p className="font-semibold">{listing.area} m²</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-blue-600 w-4"
                />
                <div>
                  <div className="text-gray-500">Year</div>
                  <div className="font-semibold">{year}</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-semibold mb-2">Property Overview</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.overview || "No overview provided."}
              </p>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-5">Similar Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex gap-4">
                  <div className="w-24 h-24 rounded overflow-hidden">
                    <Image
                      src="/Big Home1.jpg"
                      alt="Property"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-md font-semibold truncate">
                      Example Property #{n}
                    </h4>
                    <p className="text-sm text-gray-500">Some Location</p>
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      ETB 2,500,000
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:w-1/3 space-y-8">
          {/* Agent Info */}
          <div className="bg-white p-6 rounded-lg shadow space-y-3 border">
            <div className="flex items-center gap-4">
              <img
                src="/my-profilePic.jpg"
                alt="Agent Picture"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold">Shueb Ahmed</h4>
                <p className="text-sm text-gray-500">Senior Consultant</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📞 +251 991 868 812</p>
              <p>✉️ shukang@ethioaddis.com</p>
            </div>
            <Link href={"https://t.me/ShuebAhmed"}>
              <Button className="w-full bg-blue-700 hover:bg-blue-800">
                Contact Agent
              </Button>
            </Link>
          </div>

          {/* Appointment Form */}
          <AppointmentForm
            listingTitle={listing.title}
            numericId={listing.numericId} // Make sure this matches the ID in your listings
            listingImage={listing.images?.[0] || "/default-image.jpg"}
          />
        </div>
      </div>
    </div>
  );
}
