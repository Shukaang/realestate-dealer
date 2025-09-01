"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  CheckCircle,
  CornerUpLeft,
  Timer,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase/client";
import { toast } from "sonner";
import PageLoader from "@/components/shared/page-loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faHome,
  faHouse,
  faVectorSquare,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

// Types
interface Listing {
  id: string;
  numericId: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: "available" | "sold" | "pending";
  area: string;
  bedrooms: string;
  bathrooms: string;
  images?: string[];
  createdAt: any;
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listingTitle?: string;
}

// Role Verification Function
async function verifyAdminRole(
  requiredRole: "viewer" | "moderator" | "admin" | "super-admin"
) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (!adminDoc.exists()) return false;

    const adminData = adminDoc.data();

    // Super-admin can do anything
    if (adminData.role === "super-admin") return true;

    // Check if user has the required role
    return adminData.role === requiredRole;
  } catch (error) {
    console.error("Role verification failed:", error);
    return false;
  }
}

// Constants
const VALID_STATUSES = ["available", "sold", "pending"] as const;
const CITIES = [
  "Adama",
  "Addis Ababa",
  "Bahirdar",
  "Hawassa",
  "Jigjiga",
  "Negele",
];
const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Penthouse", "Mansion"];
const PRICE_RANGES = [
  { label: "Up to 1M", value: "0-1000000" },
  { label: "1M - 5M", value: "1000000-5000000" },
  { label: "5M - 10M", value: "5000000-10000000" },
  { label: "10M - 15M", value: "10000000-15000000" },
  { label: "15M+", value: "15000000" },
];

// Delete Dialog Component (unchanged)
function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
}: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-red-600">
          Confirm Deletion
        </h3>
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this listing?
        </p>
        {listingTitle && (
          <p className="mb-4 font-medium text-gray-900 dark:text-gray-100">
            "{listingTitle}"
          </p>
        )}
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone and will permanently delete all
          associated images.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Permanently
          </Button>
        </div>
      </div>
    </div>
  );
}
// Status Badge Component (unchanged)
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "sold":
        return { className: "bg-red-500", label: "Sold" };
      case "available":
        return {
          className: "bg-green-500",
          label: "Available",
        };
      case "pending":
        return {
          className: "bg-yellow-500",
          label: "Pending",
        };
      default:
        return { className: "bg-gray-500", label: status };
    }
  };

  const config = getStatusConfig(status);
  return <Badge className={config.className}>{config.label}</Badge>;
}

async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    return adminDoc.exists() ? adminDoc.data().role : null;
  } catch (error) {
    console.error("Role verification failed:", error);
    return null;
  }
}

// Main Component
export default function AdminListingsPage() {
  const {
    data: allListings = [],
    isLoading,
    mutate,
  } = useFirestoreCollection<Listing>("listings");
  const router = useRouter();
  const searchParams = useSearchParams();
  // State
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [listingToDelete, setListingToDelete] = useState<{
    id: string;
    title: string;
    images?: string[];
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Initialize filter from URL (unchanged)
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && VALID_STATUSES.includes(urlStatus as any)) {
      setFilter(urlStatus.charAt(0).toUpperCase() + urlStatus.slice(1));
    } else {
      setFilter("All");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
    };

    fetchUserRole();
  }, []);

  // Memoized filtered and sorted listings (unchanged)
  const filteredListings = useMemo(() => {
    return allListings
      .filter((listing) => {
        // Status filter
        if (filter !== "All" && listing.status !== filter.toLowerCase())
          return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !listing.title?.toLowerCase().includes(query) &&
            !listing.location?.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // City filter
        if (
          selectedCity &&
          !listing.location?.toLowerCase().includes(selectedCity.toLowerCase())
        ) {
          return false;
        }

        // Type filter
        if (
          selectedType &&
          listing.type?.toLowerCase() !== selectedType.toLowerCase()
        ) {
          return false;
        }

        // Price filter
        if (selectedPrice) {
          const price = Number(listing.price);
          const [min, max] = selectedPrice
            .split("-")
            .map((p) => Number(p.replace(/[^\d]/g, "")));

          if (max && (price < min || price > max)) return false;
          if (!max && price < min) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by creation date (newest first)
        const dateA =
          typeof a.createdAt?.toDate === "function"
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
        const dateB =
          typeof b.createdAt?.toDate === "function"
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [
    allListings,
    filter,
    searchQuery,
    selectedCity,
    selectedType,
    selectedPrice,
  ]);

  // Event Handlers with role verification
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const newUrl =
      newFilter === "All"
        ? "/admin/listings"
        : `/admin/listings?status=${newFilter.toLowerCase()}`;
    router.push(newUrl, { scroll: false });
  };
  const handleDeleteClick = async (
    id: string,
    title: string,
    images?: string[]
  ) => {
    if (userRole !== "super-admin") {
      toast.error("Only super-admins can delete listings");
      return;
    }
    setListingToDelete({ id, title, images });
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      // Delete images from storage
      if (listingToDelete.images?.length) {
        const deletePromises = listingToDelete.images.map(async (imageUrl) => {
          try {
            await deleteObject(ref(storage, imageUrl));
          } catch (error) {
            console.error(`Failed to delete image ${imageUrl}:`, error);
          }
        });
        await Promise.allSettled(deletePromises);
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, "listings", listingToDelete.id));

      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Failed to delete listing:", error);
      toast.error("Failed to delete listing");
    } finally {
      setListingToDelete(null);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: "available" | "sold" | "pending"
  ) => {
    if (isUpdating) return;

    if (!["super-admin", "admin", "moderator"].includes(userRole || "")) {
      toast.error("You don't have permission to update listings");
      return;
    }

    setIsUpdating(id);
    try {
      // First get the current document
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Listing not found");
      }

      const currentData = docSnap.data();
      const updateData: any = { status: newStatus };

      if (newStatus === "sold") {
        updateData.soldDate = Timestamp.now();
      } else if (currentData.status === "sold") {
        updateData.soldDate = null;
      }

      await updateDoc(docRef, updateData);
      toast.success(`Listing marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  // Render action buttons based on role
  const renderActionButtons = (listing: Listing) => {
    const isCurrentlyUpdating = isUpdating === listing.id;
    const buttons = [];

    // Edit button - show for moderators, admins, and super-admins
    if (["super-admin", "admin", "moderator"].includes(userRole || "")) {
      buttons.push(
        <Tooltip key="edit">
          <TooltipTrigger asChild>
            <Link href={`/admin/listings/${listing.numericId}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                disabled={isCurrentlyUpdating}
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Edit Listing</TooltipContent>
        </Tooltip>
      );
    }

    // Delete button - show only for super-admins
    if (userRole === "super-admin") {
      buttons.push(
        <Tooltip key="delete">
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isCurrentlyUpdating}
              onClick={() =>
                handleDeleteClick(listing.id, listing.title, listing.images)
              }
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Listing</TooltipContent>
        </Tooltip>
      );
    }

    // Status update buttons - show for moderators, admins, and super-admins
    if (["super-admin", "admin", "moderator"].includes(userRole || "")) {
      switch (listing.status) {
        case "available":
          buttons.push(
            <Tooltip key="mark-sold">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "sold")}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Sold</TooltipContent>
            </Tooltip>,
            <Tooltip key="mark-pending">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "pending")}
                >
                  <Timer className="w-4 h-4 text-yellow-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Pending</TooltipContent>
            </Tooltip>
          );
          break;

        case "pending":
          buttons.push(
            <Tooltip key="mark-available">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "available")}
                >
                  <CornerUpLeft className="w-4 h-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Available</TooltipContent>
            </Tooltip>,
            <Tooltip key="mark-sold">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "sold")}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Sold</TooltipContent>
            </Tooltip>
          );
          break;

        case "sold":
          buttons.push(
            <Tooltip key="mark-available">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "available")}
                >
                  <CornerUpLeft className="w-4 h-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Available</TooltipContent>
            </Tooltip>,
            <Tooltip key="mark-pending">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isCurrentlyUpdating}
                  onClick={() => handleStatusUpdate(listing.id, "pending")}
                >
                  <Timer className="w-4 h-4 text-yellow-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Pending</TooltipContent>
            </Tooltip>
          );
          break;
      }
    }

    return buttons;
  };

  if (isLoading) return <PageLoader />;

  // Rest of your UI remains exactly the same
  return (
    <div className="p-3 sm:p-6 md:p-10 bg-white dark:bg-slate-800 min-h-screen">
      <DeleteDialog
        isOpen={!!listingToDelete}
        onClose={() => setListingToDelete(null)}
        onConfirm={handleDeleteConfirm}
        listingTitle={listingToDelete?.title}
      />

      {/* Header */}
      <div className="flex items-center justify-between sm:mb-8">
        <div className="flex items-center gap-1 sm:gap-3">
          <FontAwesomeIcon icon={faHouse} className="text-blue-600 text-3xl" />
          <h1 className="text-xl sm:text-3xl font-bold">All Listings</h1>
          <Badge
            variant="blue"
            className="text-sm hidden sm:block sm:text-lg font-bold px-3 py-1"
          >
            {allListings.length}
          </Badge>
        </div>
        <Link href="/admin/upload">
          <Button className="gap-0.5 sm:gap-2">
            <Plus className="w-2 h-2 sm:w-4 sm:h-4" />
            Add New Listing
          </Button>
        </Link>
      </div>
      <Badge
        variant="blue"
        className="text-sm block sm:hidden font-semibold px-3 py-1 my-2"
      >
        {allListings.length} Listings total
      </Badge>

      {/* Filters */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or location..."
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-slate-800 dark:text-white"
          />

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Prices</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredListings.length} of {allListings.length} listings
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-blue-700 text-6xl mb-4">
            <FontAwesomeIcon icon={faHome} />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Listings Found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {allListings.length === 0
              ? "Create your first listing to get started."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900 ${
                isUpdating === listing.id
                  ? "opacity-75 pointer-events-none"
                  : ""
              }`}
            >
              {/* Image */}
              {listing.images?.[0] && (
                <div className="relative">
                  <Link href={`/admin/listings/${listing.numericId}`}>
                    <img
                      src={listing.images[0] || "/placeholder.svg"}
                      alt={listing.title}
                      loading="lazy"
                      className="w-full h-48 object-cover rounded-t-xl hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800 hover:bg-white">
                    {listing.type}
                  </Badge>
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title and Status */}
                <div className="flex justify-between items-start gap-2">
                  <Link href={`/admin/listings/${listing.numericId}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2">
                      #{listing.numericId} {listing.title}
                    </h3>
                  </Link>
                  <StatusBadge status={listing.status} />
                </div>

                {/* Location */}
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {listing.location}
                </p>

                {/* Price */}
                <p className="text-lg font-bold text-blue-600">
                  ETB {Number.parseInt(listing.price).toLocaleString()}
                </p>

                {/* Property Details */}
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faBed} className="text-blue-600" />
                    {listing.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faBath} className="text-blue-600" />
                    {listing.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon
                      icon={faVectorSquare}
                      className="text-blue-600"
                    />
                    {listing.area}m²
                  </span>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-400 dark:text-gray-500 border-t pt-2">
                  <div>
                    {listing.createdAt?.toDate?.()?.toLocaleDateString() ||
                      "Unknown date"}{" "}
                    | posted by: {listing.createdBy?.name || "Unknown creator"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 pt-2 border-t">
                  <TooltipProvider>
                    {renderActionButtons(listing)}
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
