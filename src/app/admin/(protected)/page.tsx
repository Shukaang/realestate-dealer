"use client";

import { useState, useEffect, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHandPeace,
  faHome,
  faCalendarAlt,
  faEnvelope,
  faPlus,
  faChartLine,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";

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
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
}

interface Appointment {
  id: string;
  name: string;
  listingTitle?: string;
  scheduledDate: any;
  status: "pending" | "done";
  createdAt: any;
  numericId: string;
  viewed: boolean;
  listingImage?: string;
}

interface UserMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: any;
  viewed: boolean;
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
  const [activeTab, setActiveTab] = useState<"all" | "unviewed">("unviewed");
  const { user, role, hasPermission, getIdToken } = useAuth();
  // Data fetching
  const { data: listingsData = [] } = useFirestoreCollection("listings");
  const { data: appointmentsData = [] } =
    useFirestoreCollection("appointments");
  const { data: messagesData = [] } = useFirestoreCollection("userMessages");
  const { data: adminsData = [] } = useFirestoreCollection("admins");

  // Memoized data processing
  const recentListings = useMemo(() => {
    return (listingsData as Listing[])
      .filter((l) => l.createdAt?.toDate)
      .filter((l) => l.status !== "sold")
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      )
      .slice(0, 6);
  }, [listingsData]);

  const recentAppointments = useMemo(() => {
    return (appointmentsData as Appointment[])
      .map((appt) => ({
        ...appt,
        scheduledDate: appt.scheduledDate?.toDate?.(),
      }))
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      )
      .slice(0, 5);
  }, [appointmentsData]);

  const filteredMessages = useMemo(() => {
    return (messagesData as UserMessage[])
      .filter((msg) => activeTab === "all" || msg.viewed === false)
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      )
      .slice(0, 5);
  }, [messagesData, activeTab]);

  const stats = useMemo(() => {
    return {
      listings: hasPermission("view-listings") ? listingsData.length : null,
      appointments: hasPermission("view-appointments")
        ? appointmentsData.length
        : null,
      messages: hasPermission("view-messages") ? messagesData.length : null,
      unviewedMessages: hasPermission("view-messages")
        ? (messagesData as UserMessage[]).filter((msg) => !msg.viewed).length
        : null,
      admins: hasPermission("manage-admins") ? adminsData.length : null,
    };
  }, [listingsData, appointmentsData, messagesData, adminsData, hasPermission]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
          <FontAwesomeIcon
            icon={faUser}
            className="py-3 px-2 bg-blue-200 dark:bg-blue-300 rounded-full text-blue-600"
          />
          Welcome back, {adminName}
          <FontAwesomeIcon icon={faHandPeace} className="text-amber-400" />
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening today
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {stats.listings !== null && (
          <StatCard
            label="Listings"
            value={stats.listings}
            icon={faHome}
            link="/admin/listings"
          />
        )}
        {stats.appointments !== null && (
          <StatCard
            label="Appointments"
            value={stats.appointments}
            icon={faCalendarAlt}
            link="/admin/appointments"
          />
        )}
        {stats.messages !== null && (
          <StatCard
            label="Messages"
            value={stats.messages}
            icon={faEnvelope}
            link="/admin/usermessages"
          />
        )}
        {stats.unviewedMessages !== null && (
          <StatCard
            label="Unread Messages"
            value={stats.unviewedMessages}
            icon={faEyeSlash}
            link="/admin/usermessages?filter=unviewed"
            highlight={stats.unviewedMessages > 0}
          />
        )}
        {stats.admins !== null && (
          <StatCard
            label="Admins"
            value={stats.admins}
            icon={faUser}
            link="/admin/settings"
          />
        )}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Listings */}
          {hasPermission("view-listings") && (
            <SectionContainer
              title="Recent Listings"
              link="/admin/listings"
              linkText="View All"
            >
              {recentListings.length === 0 ? (
                <EmptyState message="No listings found" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </SectionContainer>
          )}

          {hasPermission("view-appointments") && (
            <SectionContainer
              title="Recent Appointments"
              link="/admin/appointments"
              linkText="View All"
            >
              {recentAppointments.length === 0 ? (
                <EmptyState message="No appointments found" />
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((appt) => (
                    <AppointmentCard key={appt.id} appointment={appt} />
                  ))}
                </div>
              )}
            </SectionContainer>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Messages */}
          {hasPermission("view-messages") && (
            <SectionContainer
              title="Recent Messages"
              link="/admin/usermessages"
              linkText="View All"
            >
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("unviewed")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeTab === "unviewed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Unviewed ({stats.unviewedMessages})
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeTab === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  All Messages
                </button>
              </div>

              {filteredMessages.length === 0 ? (
                <EmptyState message={`No ${activeTab} messages`} />
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      onView={() => handleMessageView(message.id)}
                    />
                  ))}
                </div>
              )}
            </SectionContainer>
          )}

          {/* Quick Actions */}
          <SectionContainer title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {hasPermission("upload-content") && (
                <ActionButton
                  icon={faPlus}
                  label="New Listing"
                  href="/admin/upload"
                />
              )}
              {hasPermission("view-appointments") && (
                <ActionButton
                  icon={faCalendarAlt}
                  label="Appointment"
                  href="/admin/appointments"
                />
              )}
              <ActionButton
                icon={faChartLine}
                label="Analytics"
                href="/admin/dashboard"
              />
              {hasPermission("view-messages") && (
                <ActionButton
                  icon={faEnvelope}
                  label="New Message"
                  href="/admin/usermessages"
                />
              )}
            </div>
          </SectionContainer>
        </div>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({
  label,
  value,
  icon,
  link,
  highlight = false,
}: {
  label: string;
  value: any;
  icon: any;
  link?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`p-4 rounded-lg shadow-sm border ${
        highlight
          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
          <p
            className={`text-2xl font-bold ${
              highlight
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-800 dark:text-gray-400"
            }`}
          >
            {value}
          </p>
        </div>
        <FontAwesomeIcon
          icon={icon}
          className={`text-lg ${
            highlight
              ? "text-blue-500 dark:text-blue-700"
              : "text-blue-700 dark:text-blue-300"
          }`}
        />
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

// Component: Section Container
function SectionContainer({
  title,
  children,
  link,
  linkText,
}: {
  title: string;
  children: React.ReactNode;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {link && (
          <Link href={link} className="text-sm text-blue-600 hover:underline">
            {linkText || "View All"}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// Component: Empty State
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-gray-500">
      <p>{message}</p>
    </div>
  );
}

// Component: Listing Card
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/admin/listings/${listing.numericId}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
        {listing.images?.[0] && (
          <div className="relative overflow-hidden w-full h-44">
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="flex justify-between items-start mb-2">
              <span className="absolute top-4 left-4 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                {listing.type}
              </span>
              <span
                className={`absolute top-4 right-4 text-white text-xs font-semibold px-2 py-1 rounded-md shadow ${
                  listing.status == "available"
                    ? "bg-green-500/60"
                    : listing.status == "sold"
                    ? "bg-red-500/60"
                    : "bg-yellow-500/60"
                }`}
              >
                {listing.status}
              </span>
            </div>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-medium truncate">{listing.title}</h3>
          <p className="text-sm text-gray-500 truncate">{listing.location}</p>
          <p className="text-blue-600 font-bold mt-1">
            ETB {Number(listing.price).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Component: Appointment Card
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Link href={`/admin/appointments/${appointment.numericId}`}>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition flex justify-between items-center dark:hover:bg-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={appointment.listingImage}
            alt={appointment.listingTitle}
            className="w-16 h-16 object-cover rounded-md border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/Big Home1.jpg";
            }}
          />
          <div>
            <p className="font-medium">{appointment.name}</p>
            <p className="text-sm text-gray-500">
              {appointment.listingTitle || "General Inquiry"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(appointment.createdAt.toDate())} ago
          </span>
          <FontAwesomeIcon
            icon={appointment.status === "done" ? faCheckCircle : faClock}
            className={
              appointment.status === "done"
                ? "text-green-500"
                : "text-amber-500"
            }
          />
        </div>
      </div>
    </Link>
  );
}

// Component: Message Card
function MessageCard({
  message,
  onView,
}: {
  message: UserMessage;
  onView?: () => void;
}) {
  return (
    <Link href={`/admin/usermessages/${message.id}`} onClick={onView}>
      <div
        className={`p-4 border rounded-lg hover:shadow transition ${
          message.viewed == false
            ? "border-l-4 border-blue-500 bg-blue-50 dark:border-blue-800 dark:bg-slate-800"
            : ""
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">
              {message.firstName} {message.lastName}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {message.subject}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(message.createdAt.toDate())} ago
            </span>
            <FontAwesomeIcon
              icon={message.viewed == false ? faEyeSlash : faEye}
              className={
                message.viewed == false
                  ? "text-blue-500 dark:to-blue-700"
                  : "text-gray-400"
              }
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Component: Action Button
function ActionButton({
  icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className="text-blue-500" />
        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
}

// Helper function to handle message viewing
async function handleMessageView(messageId: string) {
  // Implement your Firestore update logic here
  // await updateDoc(doc(db, "messages", messageId), { status: "viewed" });
}
