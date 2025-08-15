"use client";

import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase/client";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";

interface UserMessage {
  id: string;
  viewed: boolean;
  createdAt: any;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

function DeleteConfirmationDialog({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p className="mb-4">
          Are you sure you want to delete this message? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MessageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: messages,
    isLoading,
    mutate,
  } = useFirestoreCollection<UserMessage>("userMessages");
  const message = messages?.find((msg) => msg.id === id);

  useEffect(() => {
    if (message && !message.viewed) {
      const markAsViewed = async () => {
        try {
          await updateDoc(doc(db, "userMessages", id as string), {
            viewed: true,
          });
          mutate((prev) =>
            prev.map((msg) => (msg.id === id ? { ...msg, viewed: true } : msg))
          );
        } catch (err) {
          console.error("Failed to mark as viewed:", err);
        }
      };
      markAsViewed();
    }
  }, [message, id, mutate]);

  const handleMarkAsViewed = async () => {
    if (!message) return;

    try {
      await updateDoc(doc(db, "userMessages", id as string), {
        viewed: true,
      });
      mutate((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, viewed: true } : msg))
      );
      toast.success("Marked as viewed");
    } catch (err) {
      console.error("Failed to mark as viewed:", err);
      toast.error("Failed to mark as viewed");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "userMessages", id as string));
      mutate((prev) => prev.filter((msg) => msg.id !== id));
      toast.success("Message deleted");
      router.push("/admin/usermessages");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!message) {
    return <div className="p-6 text-red-500">Message not found</div>;
  }

  return (
    <section className="dark:bg-slate-800">
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />

      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/usermessages")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Button>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Message from {message.firstName} {message.lastName}
            </h2>
            <Badge
              variant={message.viewed ? "default" : "destructive"}
              className={
                message.viewed
                  ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200"
              }
            >
              {message.viewed ? "Viewed" : "Unviewed"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                <Link
                  href={`mailto:${message.email}`}
                  className="hover:text-blue-600"
                >
                  {message.email}
                </Link>
              </p>
            </div>

            {message.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  <Link
                    href={`tel:${message.phone}`}
                    className="hover:text-blue-600"
                  >
                    {message.phone}
                  </Link>
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <Badge variant="secondary">{message.subject || "N/A"}</Badge>
            </div>

            <div>
              <p className="text-sm text-gray-500">Received At</p>
              <p className="font-medium">
                {format(
                  message.createdAt?.toDate?.() ||
                    (typeof message.createdAt === "string"
                      ? new Date(message.createdAt)
                      : new Date()),
                  "PPPpp"
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Message</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {!message.viewed && (
              <Button variant="outline" onClick={handleMarkAsViewed}>
                Mark as Viewed
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Message"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
