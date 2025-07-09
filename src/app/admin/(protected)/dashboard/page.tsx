"use client";

import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import Link from "next/link";

ChartJS.register(ArcElement, Tooltip, Legend);

const TrendCard = ({
  title,
  count,
  color,
}: {
  title: string;
  count: number;
  color: string;
}) => {
  const initialGoal = count < 5 ? 5 : Math.ceil(count / 5) * 5;
  const goal = count >= initialGoal ? initialGoal + 5 : initialGoal;

  const data = {
    labels: [title, "Remaining"],
    datasets: [
      {
        data: [count, Math.max(goal - count, 0)],
        backgroundColor: [color, "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center space-y-2 w-full">
      <h2 className="text-sm font-medium text-gray-600 break-words leading-tight">
        {title}
      </h2>
      <div className="w-24 h-24 mx-auto">
        <Doughnut
          data={data}
          options={{
            cutout: "70%",
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
          }}
        />
      </div>
      <p className="text-lg font-bold text-gray-800">
        {count}/{goal}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const { data: listings = [] } = useFirestoreCollection<any>("listings");
  const { data: appointments = [] } =
    useFirestoreCollection<any>("appointments");

  const soldListings = listings.filter((l) => l.status === "sold");
  const doneAppointments = appointments.filter((a) => a.status === "done");
  const totalRevenue = soldListings.reduce(
    (sum, l) => sum + (Number(l.price) || 0),
    0
  );

  // Recent Listings
  const recentListings = [...listings]
    .filter((item) => item.createdAt)
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  // Recent Appointments
  const recentAppointments = [...appointments]
    .filter((item) => item.createdAt)
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={"/admin/listings"}>
          <div className="bg-white p-4 rounded dark:bg-gray-800 shadow text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Total Listings
            </h3>
            <p className="text-2xl text-slate-950 font-semibold dark:text-gray-300">
              {listings.length}
            </p>
          </div>
        </Link>
        <Link href={"/admin/appointments"}>
          <div className="bg-white p-4 rounded dark:bg-gray-800 shadow text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Total Appointments
            </h3>
            <p className="text-2xl text-slate-950 font-semibold dark:text-gray-300">
              {appointments.length}
            </p>
          </div>
        </Link>
        <div className="bg-white p-4 rounded dark:bg-gray-800 shadow text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">
            Sold Listings
          </h3>
          <p className="text-2xl text-slate-950 font-semibold dark:text-gray-300">
            {soldListings.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded dark:bg-gray-800 shadow text-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">
            Total Revenue
          </h3>
          <p className="text-2xl text-slate-950 font-semibold dark:text-gray-300">
            ETB {Number(totalRevenue).toLocaleString("en-US")}
          </p>
        </div>
      </div>
      {/* Trend Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <TrendCard title="Listings" count={listings.length} color="#3b82f6" />
        <TrendCard
          title="Sold Listings"
          count={soldListings.length}
          color="#6366f1"
        />
        <TrendCard
          title="Appointments"
          count={appointments.length}
          color="#10b981"
        />
        <TrendCard
          title="Done Appointments"
          count={doneAppointments.length}
          color="#f59e0b"
        />
      </div>
      {/* Recent Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Listings
          </h2>
          <ul className="space-y-2">
            {recentListings.map((item, index) => {
              const date = dayjs(
                item.createdAt?.toDate?.() || item.createdAt
              ).format("MMM D, YYYY h:mm A");
              const status = item.status || "created";
              return (
                <li
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2"
                >
                  <strong className="text-blue-600 dark:text-blue-400">
                    Listing:
                  </strong>{" "}
                  {item.title || "Untitled"} ({status}) –{" "}
                  <span className="text-xs">{date}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Appointments
          </h2>
          <ul className="space-y-2">
            {recentAppointments.map((item, index) => {
              const date = dayjs(
                item.createdAt?.toDate?.() || item.createdAt
              ).format("MMM D, YYYY h:mm A");
              const status = item.status || "created";
              return (
                <li
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2"
                >
                  <strong className="text-green-600 dark:text-green-400">
                    Appointment:
                  </strong>{" "}
                  {item.name || "Unnamed"} ({status}) –{" "}
                  <span className="text-xs">{date}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
