"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBath,
  faMapMarkerAlt,
  faVectorSquare,
} from "@fortawesome/free-solid-svg-icons";

interface PropertyCardProps {
  property: {
    numericId: number;
    title: string;
    price: number;
    location: string;
    description?: string;
    images?: string[];
    status?: string;
    for: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  view?: "list" | "grid";
}

const PropertyCard: FC<PropertyCardProps> = ({ property, view = "list" }) => {
  const detailUrl = `/listings/${property.numericId}`;

  if (view === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col md:flex-row">
        {/* Image (left side) */}
        <div className="relative md:w-1/3 w-full h-full md:h-64 overflow-hidden">
          {property.images && property.images.length > 0 && (
            <img
              src={property.images[0]}
              alt={property.title}
              loading="lazy"
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            />
          )}
          {/* Status Badge */}
          <span className="absolute top-4 left-4 bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-md shadow">
            For {property.for || "Sale"}
          </span>
        </div>

        {/* Content (right side) */}
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900 whitespace-normal sm:truncate">
                {property.title}
              </h3>
              <span className="text-xs bg-gray-900/80 text-white px-2 py-0.5 rounded-md">
                {property.type}
              </span>
            </div>
            <p className="text-gray-500 mb-3 flex items-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="w-4 mr-2 text-blue-700"
              />
              {property.location}
            </p>
            <p className="text-xl font-bold text-blue-700 mb-2">
              ETB {Number(property.price).toLocaleString("en-US")}
            </p>
            <p className="text-gray-700 mb-4 line-clamp-4 sm:line-clamp-2">
              {property.description}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-gray-500 border-t border-gray-200 pt-4 mb-4 text-sm">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBed} className="w-4 mr-2" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBath} className="w-4 mr-2" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faVectorSquare} className="w-4 mr-2" />
                <span>{property.area} m²</span>
              </div>
            </div>

            <Link
              href={detailUrl}
              className="inline-block text-sm text-center w-full bg-blue-700 text-white rounded py-2 px-4 hover:bg-blue-800 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border animate-on-scroll animate-pc-only delay-200">
      <div className="relative w-full h-65 overflow-hidden animate-on-scroll animate-mobile-only delay-100">
        {property.images && property.images.length > 0 && (
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
        )}
        <span className="absolute top-4 left-4 bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-md shadow">
          For {property.for || "Sale"}
        </span>
        <span className="absolute top-4 right-4 bg-gray-900/80 text-white text-xs font-semibold px-3 py-1 rounded-md shadow">
          {property.type}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
          {property.title}
        </h3>
        <p className="text-gray-500 mb-3 flex items-center">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="w-4 mr-2 text-blue-700"
          />
          {property.location}
        </p>
        <p className="text-xl font-bold text-blue-700 mb-4">
          ETB {Number(property.price).toLocaleString("en-US")}
        </p>
        <div className="flex justify-between text-gray-500 border-t border-gray-200 pt-4 text-sm">
          <span>
            <FontAwesomeIcon icon={faBed} className="w-4 mr-2" />
            {property.bedrooms} Beds
          </span>
          <span>
            <FontAwesomeIcon icon={faBath} className="w-4 mr-2" />
            {property.bathrooms} Baths
          </span>
          <span>
            <FontAwesomeIcon icon={faVectorSquare} className="w-4 mr-2" />
            {property.area} m²
          </span>
        </div>
        <div className="mt-4">
          <Link
            href={detailUrl}
            className="inline-block text-sm text-center w-full bg-blue-700 text-white rounded py-2 px-4 hover:bg-blue-800 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
