"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc as docRef,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { format } from "date-fns";
import { db } from "@/lib/firebase";

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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AppointmentDetailsPage() {
  const [notFound, setNotFound] = useState(false);
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;

      try {
        // Query by numericId instead of document ID
        const q = query(
          collection(db, "appointments"),
          where("numericId", "==", id)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const appointmentId = docSnap.id;

          // Mark as viewed
          await updateDoc(doc(db, "appointments", appointmentId), {
            viewed: true,
          });

          setAppointment({
            id: appointmentId,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() ?? null,
            scheduledDate: docSnap.data().scheduledDate?.toDate?.() ?? null,
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!appointment) return;

    try {
      setUpdating(true);
      await updateDoc(docRef(db, "appointments", appointment.id), {
        status: newStatus,
      });
      setAppointment({ ...appointment, status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
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

  if (notFound && !appointment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">
              Appointment Not Found
            </CardTitle>
            <CardDescription>
              The requested appointment could not be found.
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

        {appointment?.status === "pending" && (
          <Button
            onClick={() => handleStatusUpdate("done")}
            disabled={updating}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            {updating ? "Updating..." : "Mark as Completed"}
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
              <CardDescription className="flex items-center gap-2 mt-1">
                <Home className="w-4 h-4" />
                {appointment.listingTitle || "Property viewing"}
              </CardDescription>
            </div>
            <Badge
              variant={appointment.status === "done" ? "default" : "secondary"}
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
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-gray-100"></div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{appointment.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <Link
                      href={`mailto:${appointment.email}`}
                      className="hover:underline"
                    >
                      {appointment.email}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <Link
                      href={`tel:${appointment.phone}`}
                      className="hover:underline"
                    >
                      {appointment.phone}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Client Message
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {appointment.message || "No message provided."}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booked On:</span>
                    <span>
                      {appointment.createdAt
                        ? format(appointment.createdAt, "PPpp")
                        : "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scheduled For:</span>
                    <span>
                      {appointment.scheduledDate
                        ? format(appointment.scheduledDate, "PPpp")
                        : "Not scheduled"}
                    </span>
                  </div>
                </div>
              </div>

              {appointment.listingImage && (
                <div className="space-y-2">
                  <h4 className="font-medium">Property Image</h4>
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={appointment.listingImage}
                      alt={appointment.listingTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-listing.jpg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
