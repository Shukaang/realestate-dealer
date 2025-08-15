"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  listingTitle: string;
  listingNumericId: string;
  listingImage?: string;
  scheduledDate?: FirestoreTimestamp;
  status: string;
  viewed?: boolean;
  numericId: string;
  createdAt: any;
  message?: string;
}

interface Listing {
  numericId: string;
  title: string;
  images: string[];
}

interface MergedAppointment extends Appointment {
  listingImage: string;
  listingTitle: string;
}

export default function AppointmentsPage() {
  const { role } = useAuth();
  const {
    data: appointments,
    error,
    isLoading,
  } = useFirestoreCollection("appointments");

  const [mergedAppointments, setMergedAppointments] = useState<Appointment[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchDate, setSearchDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  // Check permissions
  const canUpdate = ["super-admin", "admin", "moderator"].includes(role || "");
  const canDelete = role === "super-admin";

  // Fetch listing images and merge with appointments
  useEffect(() => {
    const fetchListingImages = async () => {
      if (!appointments || appointments.length === 0) return;

      setIsProcessing(true);
      try {
        // Get unique listing IDs from appointments
        const uniqueListingIds = [
          ...new Set(appointments.map((a) => a.listingNumericId)),
        ].filter(Boolean);

        if (uniqueListingIds.length === 0) {
          setMergedAppointments(appointments);
          return;
        }

        const listingsQuery = query(
          collection(db, "listings"),
          where("numericId", "in", uniqueListingIds)
        );

        const snapshot = await getDocs(listingsQuery);
        const listingsData: Record<string, Listing> = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          listingsData[data.numericId] = {
            numericId: data.numericId,
            title: data.title,
            images: data.images || [],
          };
        });

        // Merge appointments with listing data
        const withImages = appointments.map((a) => {
          const listing = listingsData[a.listingNumericId];
          return {
            ...a,
            listingImage: listing?.images?.[0] || "/Big Home1.jpg",
            listingTitle: listing?.title || a.listingTitle,
          };
        });

        setMergedAppointments(withImages);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setMergedAppointments(appointments);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchListingImages();
  }, [appointments]);

  // Filter appointments based on status and date
  const filteredAppointments = useMemo(() => {
    return mergedAppointments.filter((a) => {
      const statusMatch =
        statusFilter === "all" ||
        a.status.toLowerCase() === statusFilter.toLowerCase();
      let dateMatch = true;
      if (searchDate && a.scheduledDate?.seconds) {
        const appointmentDate = new Date(a.scheduledDate.seconds * 1000);
        const filterDate = new Date(searchDate);
        dateMatch =
          appointmentDate.toDateString() === filterDate.toDateString();
      }
      return statusMatch && dateMatch;
    });
  }, [mergedAppointments, statusFilter, searchDate]);

  const handleMarkAsDone = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "done",
        viewed: true,
      });
      toast.success("Appointment marked as done.");
      setMergedAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "done", viewed: true } : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointmentId) return;
    try {
      await deleteDoc(doc(db, "appointments", selectedAppointmentId));
      setMergedAppointments((prev) =>
        prev.filter((app) => app.id !== selectedAppointmentId)
      );
      toast.success("Appointment deleted successfully.");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment.");
    } finally {
      setShowConfirmDialog(false);
      setSelectedAppointmentId(null);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">
              Error loading appointments
            </h2>
            <p>{error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || isProcessing) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-800 mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Calendar className="w-6 h-6 text-blue-600" />
            Appointments
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and track all property viewing appointments
          </p>
        </div>
      </div>
      <Card className="dark:bg-slate-900 dark:border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                  <SelectItem value="all" className="dark:hover:bg-slate-700">
                    All Appointments
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="dark:hover:bg-slate-700"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem value="done" className="dark:hover:bg-slate-700">
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-[180px] dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredAppointments.length} appointment(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="dark:bg-slate-800">
                <TableRow className="dark:border-slate-700">
                  <TableHead className="w-[200px] dark:text-gray-300">
                    Client
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Property</TableHead>
                  <TableHead className="w-[200px] dark:text-gray-300">
                    Date & Time
                  </TableHead>
                  <TableHead className="w-[120px] dark:text-gray-300">
                    Status
                  </TableHead>
                  {(canUpdate || canDelete) && (
                    <TableHead className="w-[180px] text-right dark:text-gray-300">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow className="dark:border-slate-700">
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center dark:text-gray-400"
                    >
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments
                    .sort(
                      (a, b) =>
                        b.createdAt.toDate().getTime() -
                        a.createdAt.toDate().getTime()
                    )
                    .map((appointment) => (
                      <TableRow
                        key={appointment.id}
                        className="dark:border-slate-700 dark:hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <Link
                                href={`/admin/appointments/${appointment.numericId}`}
                                className="font-medium hover:underline dark:text-white"
                              >
                                {appointment.name}
                              </Link>
                              {!appointment.viewed && (
                                <Badge className="ml-2 bg-amber-100 text-amber-800 animate-pulse dark:bg-amber-900/30 dark:text-amber-300">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border dark:border-slate-700">
                              <Link
                                href={`/admin/listings/${appointment.listingNumericId}`}
                              >
                                <img
                                  src={appointment.listingImage}
                                  alt={appointment.listingTitle}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder-listing.jpg";
                                  }}
                                />
                              </Link>
                            </div>
                            <span className="font-medium dark:text-white">
                              {appointment.listingTitle}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="dark:text-gray-400">
                          {appointment.scheduledDate ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              {format(
                                new Date(
                                  appointment.scheduledDate.seconds * 1000
                                ),
                                "PPpp"
                              )}
                            </div>
                          ) : (
                            "Not scheduled"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              appointment.status === "done"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }
                          >
                            {appointment.status === "done" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {(canUpdate || canDelete) && (
                          <TableCell className="text-right space-x-2">
                            {canUpdate && appointment.status !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                                onClick={() => handleMarkAsDone(appointment.id)}
                              >
                                Mark Done
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                                onClick={() => {
                                  setSelectedAppointmentId(appointment.id);
                                  setShowConfirmDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                No appointments found
              </div>
            ) : (
              filteredAppointments
                .sort(
                  (a, b) =>
                    b.createdAt.toDate().getTime() -
                    a.createdAt.toDate().getTime()
                )
                .map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-4 space-y-3 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold dark:text-white">
                        <Link
                          href={`/admin/appointments/${appointment.numericId}`}
                          className="hover:underline"
                        >
                          {appointment.name}
                        </Link>
                        {!appointment.viewed && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 animate-pulse dark:bg-amber-900/30 dark:text-amber-300">
                            New
                          </Badge>
                        )}
                      </div>
                      <Badge
                        className={
                          appointment.status === "done"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={appointment.listingImage}
                        alt={appointment.listingTitle}
                        className="w-16 h-16 object-cover rounded-md border dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Big Home1.jpg";
                        }}
                      />
                      <div className="font-medium dark:text-white">
                        {appointment.listingTitle}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.scheduledDate
                        ? format(
                            new Date(appointment.scheduledDate.seconds * 1000),
                            "PPpp"
                          )
                        : "Not scheduled"}
                    </div>
                    {(canUpdate || canDelete) && (
                      <div className="flex gap-2">
                        {canUpdate && appointment.status !== "done" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                            onClick={() => handleMarkAsDone(appointment.id)}
                          >
                            Mark Done
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-destructive/10"
                            onClick={() => {
                              setSelectedAppointmentId(appointment.id);
                              setShowConfirmDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                ))
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Delete Appointment
            </DialogTitle>
          </DialogHeader>
          <p className="dark:text-gray-400">
            Are you sure you want to delete this appointment?
          </p>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="dark:border-slate-700 dark:text-white"
            >
              Cancel
            </Button>
            <Button className="text-destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
