"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandPaper,
  faHandPeace,
  faPerson,
  faPersonRays,
  faPersonRifle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faMeetup } from "@fortawesome/free-brands-svg-icons";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  createdAt: any;
  images?: string[];
  numericId: string;
  type: string;
  status: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  createdBy: string;
}

interface Appointment {
  id: string;
  fullName: string;
  listingTitle?: string;
  scheduledDate: any;
  status: string;
  createdAt: any;
  numericId: string;
}

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("Admin");

  const { data: listingsData = [] } = useFirestoreCollection("listings");
  const { data: appointmentsData = [] } =
    useFirestoreCollection("appointments");
  const { data: adminsData = [] } = useFirestoreCollection("admins");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminsData.length > 0) {
        const matchedAdmin = (adminsData as Admin[]).find(
          (admin) => admin.email === user.email
        );
        if (matchedAdmin) {
          setAdminName(`${matchedAdmin.firstName} ${matchedAdmin.lastName}`);
        }
      }
    });
    return () => unsubscribe();
  }, [adminsData]);

  const recentListings = (listingsData as Listing[])
    .filter((l) => l.createdAt?.toDate)
    .sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    )
    .slice(0, 6);
  const recentAppointments = (appointmentsData as Appointment[])
    .map((appt) => ({
      ...appt,
      scheduledDate: appt.scheduledDate?.toDate
        ? appt.scheduledDate.toDate()
        : appt.scheduledDate,
    }))
    .sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    )
    .slice(0, 5);

  const stats = {
    listings: listingsData.length,
    appointments: appointmentsData.length,
    admins: adminsData.length,
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">
        <span>
          <FontAwesomeIcon icon={faUser} className="text-blue-600 mr-4" />
        </span>
        Welcome back, {adminName}{" "}
        <span>
          <FontAwesomeIcon icon={faHandPeace} className="text-amber-400" />
        </span>
      </h1>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/listings">
          <StatCard label="Listings" value={stats.listings} />
        </Link>
        <Link href="/admin/appointments">
          <StatCard label="Appointments" value={stats.appointments} />
        </Link>
        <StatCard label="Admins" value={stats.admins} />
      </div>

      {/* 🏡 Recent Listings */}
      <h2 className="text-xl font-semibold mb-4">Recent Listings</h2>
      {recentListings.length === 0 ? (
        <p className="text-sm text-gray-400">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {recentListings.map((listing: Listing) => (
            <div
              key={listing.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md transition"
            >
              {listing.images && listing.images.length > 0 && (
                <Link href={`/admin/listings/${listing.numericId}`}>
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{listing.title}</h3>
                <p className="text-gray-500 text-sm mb-1">{listing.location}</p>
                <p className="text-blue-600 font-bold">
                  ETB {Number(listing.price).toLocaleString("en-US")}
                </p>
                <p className="text-xs text-gray-500">
                  Created by: <span className="font-semibold">{adminName}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📅 Recent Appointments */}
      <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
      {recentAppointments.length === 0 ? (
        <p className="text-sm text-gray-400">No appointments found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {recentAppointments.map((appt: Appointment) => (
            <Link key={appt.id} href={`/admin/appointments/${appt.numericId}`}>
              <div className="p-4 rounded-lg border hover:shadow transition cursor-pointer">
                <p className="font-medium">{appt.fullName}</p>
                <p className="text-sm text-gray-500">
                  {appt.listingTitle || "Listing"} —{" "}
                  {appt.scheduledDate
                    ? new Date(appt.scheduledDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    appt.status === "Viewed"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {appt.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// 📦 Reusable card component
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
