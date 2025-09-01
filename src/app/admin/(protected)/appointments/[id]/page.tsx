"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowLeft,
  Home,
  User,
  Hash,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface Appointment {
  id: string;
  numericId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "pending" | "done";
  listingTitle?: string;
  listingImage?: string;
  createdAt?: FirestoreTimestamp;
  scheduledDate?: any;
  viewed: boolean;
}

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Fetch appointment using numericId
  const {
    data: appointments,
    mutate,
    isLoading,
    error,
  } = useFirestoreCollection<Appointment>("appointments");

  // Find the appointment with matching numericId
  const appointment = appointments?.find((apt) => apt.numericId === id);

  // Mark as viewed once it's fetched and not already viewed
  useEffect(() => {
    if (appointment && appointment.id && !appointment.viewed) {
      const markAsViewed = async () => {
        try {
          await updateDoc(doc(db, "appointments", appointment.id), {
            viewed: true,
          });
          // Update local state optimistically
          mutate((prev) =>
            prev.map((apt) =>
              apt.id === appointment.id ? { ...apt, viewed: true } : apt
            )
          );
        } catch (error) {
          console.error("Failed to mark appointment as viewed:", error);
        }
      };
      markAsViewed();
    }
  }, [appointment, mutate]);

  const handleStatusUpdate = async (newStatus: "pending" | "done") => {
    if (!appointment) return;

    try {
      // Optimistic update
      mutate((prev) =>
        prev.map((apt) =>
          apt.id === appointment.id
            ? { ...apt, status: newStatus, viewed: true }
            : apt
        )
      );

      await updateDoc(doc(db, "appointments", appointment.id), {
        status: newStatus,
        viewed: true,
      });

      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update status");

      // Rollback optimistic update
      mutate((prev) =>
        prev.map((apt) =>
          apt.id === appointment.id
            ? { ...apt, status: appointment.status }
            : apt
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">
              Appointment Not Found
            </CardTitle>
            <CardDescription>
              The requested appointment could not be found or does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/appointments")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <section className="dark:bg-slate-800">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/appointments")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Button>
          {appointment.status === "pending" && (
            <Button
              onClick={() => handleStatusUpdate("done")}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Completed
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="w-6 h-6" />
                  {appointment.name}
                </CardTitle>
                {appointment.listingTitle && (
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Home className="w-4 h-4" />
                    {appointment.listingTitle}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant={
                  appointment.status === "done" ? "default" : "secondary"
                }
                className={
                  appointment.status === "done"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }
              >
                {appointment.status === "done" ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <Clock className="w-4 h-4 mr-1" />
                )}
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info + Message */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="flex items-start gap-4">
                  <div className="hidden sm:block p-2 rounded-full bg-gray-100 dark:bg-slate-800">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{appointment.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <Link
                        href={`mailto:${appointment.email}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {appointment.email}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <Link
                        href={`tel:${appointment.phone}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {appointment.phone}
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Message Section */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Client Message
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {appointment.message || "No message provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates + Image */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Appointment Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          appointment.status === "done"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          appointment.status === "done"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span className="font-medium">Booked On:</span>
                      <span>
                        {appointment.createdAt
                          ? format(
                              new Date(appointment.createdAt.seconds * 1000),
                              "PPpp"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span className="font-medium">Scheduled For:</span>
                      <span>
                        {appointment.scheduledDate
                          ? format(
                              new Date(
                                appointment.scheduledDate.seconds * 1000
                              ),
                              "PPpp"
                            )
                          : "Not scheduled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span className="font-medium">Viewed:</span>
                      <Badge
                        variant={appointment.viewed ? "success" : "secondary"}
                      >
                        {appointment.viewed ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {appointment.listingImage && (
              <div className="space-y-2 mt-5">
                <h4 className="font-medium">Property Image</h4>
                <div className="flex items-center">
                  <div className="rounded-lg h-auto w-128 overflow-hidden border">
                    <img
                      src={appointment.listingImage || "/placeholder.svg"}
                      alt={appointment.listingTitle || "Property"}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Big Home1";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
