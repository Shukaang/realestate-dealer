"use client";

import { useMemo } from "react";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import {
  HomeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { SalesChart } from "@/components/admin/dashboard/slaes-chart";
import Link from "next/link";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const {
    data: listings = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useFirestoreCollection<any>("listings");
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useFirestoreCollection<any>("appointments");
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useFirestoreCollection<any>("userMessages");

  // Data processing
  const soldListings = useMemo(
    () => listings.filter((l) => l.status === "sold"),
    [listings]
  );
  const activeListings = useMemo(
    () => listings.filter((l) => l.status === "available"),
    [listings]
  );
  const pendingListings = useMemo(
    () => listings.filter((l) => l.status === "pending"),
    [listings]
  );

  // Appointment status counts
  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === "done").length,
    [appointments]
  );
  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status !== "done").length,
    [appointments]
  );

  // Message status counts
  const readMessages = useMemo(
    () => messages.filter((m) => m.viewed).length,
    [messages]
  );
  const unreadMessages = useMemo(
    () => messages.filter((m) => !m.viewed).length,
    [messages]
  );

  // Visualization data
  const statusDistribution = {
    labels: ["Available", "Sold", "Pending"],
    datasets: [
      {
        data: [
          activeListings.length,
          soldListings.length,
          pendingListings.length,
        ],
        backgroundColor: ["#4f46e5", "#10b981", "#f59e0b"],
      },
    ],
  };

  const appointmentStatusDistribution = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completedAppointments, pendingAppointments],
        backgroundColor: ["#10b981", "#f59e0b"],
      },
    ],
  };

  const messageStatusDistribution = {
    labels: ["Read", "Unread"],
    datasets: [
      {
        data: [readMessages, unreadMessages],
        backgroundColor: ["#3b82f6", "#93c5fd"],
      },
    ],
  };

  // Key metrics
  const totalSoldAmount = useMemo(
    () =>
      soldListings.reduce(
        (sum, listing) => sum + (Number(listing.price) || 0),
        0
      ),
    [soldListings]
  );

  const averagePrice = useMemo(() => {
    const prices = activeListings.map((l) => Number(l.price) || 0);
    return prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;
  }, [activeListings]);

  // Price distribution with dynamic ranges
  const priceDistribution = useMemo(() => {
    const prices = listings.map((l) => Number(l.price) || 0);
    const maxPrice = Math.max(...prices, 0);
    const minPrice = Math.min(...prices, 0);

    // Calculate dynamic ranges
    const rangeSize = Math.ceil((maxPrice - minPrice) / 5) || 1;
    const ranges = [];

    for (let i = 0; i < 5; i++) {
      const lower = minPrice + i * rangeSize;
      const upper = minPrice + (i + 1) * rangeSize;
      ranges.push({
        label: `ETB ${(lower / 1000000).toFixed(1)}M - ${(
          upper / 1000000
        ).toFixed(1)}M`,
        min: lower,
        max: upper,
      });
    }

    return {
      labels: ranges.map((r) => r.label),
      datasets: [
        {
          label: "Listings by Price Range",
          data: ranges.map(
            (range) =>
              listings.filter((l) => {
                const price = Number(l.price) || 0;
                return price >= range.min && price < range.max;
              }).length
          ),
          backgroundColor: [
            "#93c5fd",
            "#60a5fa",
            "#3b82f6",
            "#1d4ed8",
            "#1e3a8a",
          ],
        },
      ],
    };
  }, [listings]);

  // Top locations (showing top 6 on dashboard)
  const topLocations = useMemo(() => {
    const locationCounts = listings.reduce((acc, listing) => {
      const location = listing.location || "Unknown";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [listings]);

  if (listingsLoading || appointmentsLoading || messagesLoading)
    return <DashboardSkeleton />;
  if (listingsError || appointmentsError || messagesError)
    return <ErrorState />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Real Estate Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Listings"
            value={listings.length}
            icon={HomeIcon}
            href="/admin/listings"
          />
          <MetricCard
            title="Total Sold"
            value={soldListings.length}
            icon={BuildingOfficeIcon}
            href="/admin/listings?status=sold"
          />
          <MetricCard
            title="Total Sold Amount"
            value={`ETB ${totalSoldAmount.toLocaleString()}`}
            icon={CurrencyDollarIcon}
          />
          <MetricCard
            title="Active Listings"
            value={activeListings.length}
            icon={BuildingOfficeIcon}
            href="/admin/listings?status=available"
            trend={activeListings.length > listings.length / 2 ? "up" : "down"}
          />

          <MetricCard
            title="Avg. Price"
            value={`ETB ${averagePrice.toLocaleString()}`}
            icon={CurrencyDollarIcon}
          />
          <MetricCard
            title="Pending Listings"
            value={pendingListings.length}
            icon={ClockIcon}
            href="/admin/listings?status=pending"
          />
          <MetricCard
            title="Total Appointments"
            value={appointments.length}
            icon={CalendarIcon}
            href="/admin/appointments"
          />
          <MetricCard
            title="Total Messages"
            value={messages.length}
            icon={EnvelopeIcon}
            href="/admin/usermessages"
          />
        </div>

        {/* First Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Overview */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sales Performance</h2>
              <Link
                href="/admin/dashboard/sales"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                View Details <ChartBarIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="h-64">
              <SalesChart simplified={true} />
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
            <div className="h-64">
              <Doughnut
                data={statusDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Price Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Price Distribution</h2>
            <div className="h-64">
              <Bar
                data={priceDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top Locations</h2>
              <Link
                href="/admin/dashboard/locations"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                View All <MapPinIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="h-64">
              <Bar
                data={{
                  labels: topLocations.map(([location]) => location),
                  datasets: [
                    {
                      label: "Listings",
                      data: topLocations.map(([_, count]) => count),
                      backgroundColor: [
                        "#4f46e5",
                        "#10b981",
                        "#f59e0b",
                        "#3b82f6",
                        "#93c5fd",
                        "#60a5fa",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Third Row of Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Appointment Status */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Appointment Status</h2>
            <div className="h-64">
              <Doughnut
                data={appointmentStatusDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>

          {/* Message Status */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Message Status</h2>
            <div className="h-64">
              <Doughnut
                data={messageStatusDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: "up" | "down";
  href?: string;
}) => {
  const content = (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-700 dark:text-blue-400 text-blue-600">
          <Icon className="h-5 w-5 font-semibold" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 text-xs flex items-center">
          {trend === "up" ? (
            <>
              <span className="text-green-500">↑</span>
              <span className="text-green-500 ml-1">Good</span>
            </>
          ) : (
            <>
              <span className="text-red-500">↓</span>
              <span className="text-red-500 ml-1">Needs attention</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="hover:opacity-80 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
};

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-gray-200 rounded animate-pulse lg:col-span-2"></div>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Error State
const ErrorState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-6 max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load data
      </h2>
      <p className="text-gray-500 mb-4">
        Please check your connection and try again
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  </div>
);

export default Dashboard;
