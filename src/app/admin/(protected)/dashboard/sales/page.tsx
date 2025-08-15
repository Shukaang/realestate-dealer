"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { ArrowLeftIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Title
);

interface Listing {
  status: string;
  price: number | string;
  soldDate?: any; // Firestore Timestamp or Date
  createdBy?: {
    email: string;
    name: string;
    uid: string;
  };
  type?: string;
}

const SalesPerformancePage = () => {
  const {
    data: listings = [],
    isLoading,
    error,
  } = useFirestoreCollection<Listing>("listings");

  const params = useParams();
  const router = useRouter();
  const { hasPermission, loading: authLoading, user, role } = useAuth();

  // Filter and normalize sold listings
  const soldListings = useMemo(
    () =>
      listings
        .filter((l) => l.status === "sold")
        .map((listing) => {
          const price =
            typeof listing.price === "number" && !isNaN(listing.price)
              ? listing.price
              : typeof listing.price === "string"
              ? parseFloat(listing.price.replace(/[^0-9.]/g, "")) || 0
              : 0;

          const soldDate =
            listing.soldDate instanceof Date
              ? listing.soldDate
              : listing.soldDate?.toDate?.() || null;

          return {
            ...listing,
            price,
            soldDate,
            createdBy: listing.createdBy || {
              email: "unknown@example.com",
              name: "Unknown Agent",
              uid: "unknown",
            },
            type: listing.type || "Unknown Type",
          };
        })
        .filter((listing) => listing.soldDate), // only include valid dates
    [listings]
  );

  // Monthly sales trend
  const monthlySalesData = useMemo(() => {
    const salesByMonth: Record<string, { count: number; amount: number }> = {};

    soldListings.forEach((listing) => {
      if (!listing.soldDate) return;

      const date = listing.soldDate;
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = { count: 0, amount: 0 };
      }

      salesByMonth[monthYear].count += 1;
      salesByMonth[monthYear].amount += listing.price;
    });

    return Object.entries(salesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }));
  }, [soldListings]);

  // Top agents by sales amount
  const agentPerformance = useMemo(() => {
    const salesByAgent: Record<string, { amount: number; name: string }> = {};

    soldListings.forEach((listing) => {
      const agentKey = listing.createdBy?.uid || "unknown";
      const agentName = listing.createdBy?.name || "Unknown Agent";

      if (!salesByAgent[agentKey]) {
        salesByAgent[agentKey] = { amount: 0, name: agentName };
      }

      salesByAgent[agentKey].amount += listing.price;
    });

    return Object.entries(salesByAgent)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 10)
      .map(([uid, data]) => ({
        uid,
        name: data.name,
        amount: data.amount,
      }));
  }, [soldListings]);

  // Sales by property type
  const propertyTypeSales = useMemo(() => {
    const salesByType: Record<string, number> = {};

    soldListings.forEach((listing) => {
      const type = listing.type || "Unknown Type";
      salesByType[type] = (salesByType[type] || 0) + listing.price;
    });

    return Object.entries(salesByType).sort((a, b) => b[1] - a[1]);
  }, [soldListings]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading data
      </div>
    );

  // Check if user has permission to edit listings
  if (!hasPermission("view-dashboard")) {
    return (
      <section className="dark:bg-slate-800">
        <div className="mx-auto py-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to view dashboard. This action
                requires
                <strong className="">"view-dashboard"</strong> permission.
              </CardDescription>
              {role && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Your current role:{" "}
                    <span className="font-medium capitalize">{role}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact your administrator to request access.
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="gap-2 w-full"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back to Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
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
            <CurrencyDollarIcon className="h-6 w-6 mr-2" />
            Sales Performance
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Sales</h3>
            <p className="text-2xl font-semibold">
              ETB{" "}
              {soldListings
                .reduce((sum, l) => sum + l.price, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-semibold">{soldListings.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Avg. Sale Price</h3>
            <p className="text-2xl font-semibold">
              ETB{" "}
              {(
                soldListings.reduce((sum, l) => sum + l.price, 0) /
                (soldListings.length || 1)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Sales Trend */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Monthly Sales Trend</h2>
            {monthlySalesData.length > 0 ? (
              <div className="h-80">
                <Line
                  data={{
                    labels: monthlySalesData.map((d) => d.month),
                    datasets: [
                      {
                        label: "Sales Amount (ETB)",
                        data: monthlySalesData.map((d) => d.amount),
                        borderColor: "#4f46e5",
                        backgroundColor: "rgba(79, 70, 229, 0.1)",
                        tension: 0.3,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => [
                            `ETB ${context.parsed.y.toLocaleString()}`,
                            `${
                              monthlySalesData[context.dataIndex].count
                            } sales`,
                          ],
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) =>
                            `ETB ${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No sales data available with dates
              </div>
            )}
          </div>

          {/* Top Performing Agents */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Top Performing Agents
            </h2>
            {agentPerformance.length > 0 ? (
              <div className="h-80">
                <Bar
                  data={{
                    labels: agentPerformance.map(
                      (agent) => agent.name || "Unknown"
                    ),
                    datasets: [
                      {
                        label: "Sales Amount (ETB)",
                        data: agentPerformance.map((agent) => agent.amount),
                        backgroundColor: "#10b981",
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `ETB ${context.parsed.x.toLocaleString()}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) =>
                            `ETB ${Number(value).toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No agent sales data available
              </div>
            )}
          </div>
        </div>

        {/* Property Type Sales */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sales by Property Type</h2>
          {propertyTypeSales.length > 0 ? (
            <div className="h-96">
              <Bar
                data={{
                  labels: propertyTypeSales.map(([type]) => type),
                  datasets: [
                    {
                      label: "Sales Amount (ETB)",
                      data: propertyTypeSales.map(([_, amount]) => amount),
                      backgroundColor: "#3b82f6",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `ETB ${context.parsed.y.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) =>
                          `ETB ${Number(value).toLocaleString()}`,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No property type sales data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPerformancePage;
