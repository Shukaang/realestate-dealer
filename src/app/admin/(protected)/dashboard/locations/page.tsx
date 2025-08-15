"use client";

import { useMemo } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface Listing {
  location?: string;
  [key: string]: any;
}

const LocationDistributionPage = () => {
  const {
    data: listings = [],
    isLoading,
    error,
  } = useFirestoreCollection<Listing>("listings");

  const locationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};

    listings.forEach((listing) => {
      const location =
        typeof listing.location === "string" && listing.location.trim()
          ? listing.location.trim()
          : "Unknown";
      counts[location] = (counts[location] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const labels = sorted.map(([location]) => location);
    const data = sorted.map(([_, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: "Listings",
          data,
          fill: true,
          tension: 0.4, // makes the curve smooth
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          pointBackgroundColor: "#4f46e5",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [listings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading location data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load data. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/admin/dashboard" className="mr-4">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <MapPinIcon className="h-6 w-6 mr-2" />
            Location Distribution
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              Distribution of {listings.length.toLocaleString()} total listings
              across locations
            </p>
          </div>

          {locationDistribution.labels.length > 0 ? (
            <div className="h-[70vh] overflow-x-auto">
              <Line
                data={locationDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.parsed.y} listings in ${context.label}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 60,
                        minRotation: 30,
                        autoSkip: false,
                      },
                      title: {
                        display: true,
                        text: "Location",
                        color: "#9ca3af",
                      },
                    },
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Number of Listings",
                        color: "#9ca3af",
                      },
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-[70vh] flex items-center justify-center text-gray-400">
              No listings data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDistributionPage;
