"use client";

import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function MessageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      const ref = doc(db, "userMessages", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMessage({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchMessage();
  }, [id]);

  const markAsViewed = async () => {
    await updateDoc(doc(db, "userMessages", id as string), { viewed: true });
    setMessage((prev: any) => ({ ...prev, viewed: true }));
    toast.success("Marked as viewed");
  };

  const deleteMessage = async () => {
    await deleteDoc(doc(db, "userMessages", id as string));
    toast.success("Message deleted");
    router.push("/admin/usermessages");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  if (!message)
    return <div className="p-6 text-red-500">Message not found</div>;

  return (
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
            className={
              message.viewed
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }
          >
            {message.viewed ? "Viewed" : "Unviewed"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{message.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{message.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <Badge variant="secondary">{message.subject || "N/A"}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Received At</p>
            <p className="font-medium">
              {format(message.createdAt?.toDate?.() || new Date(), "PPPpp")}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Message</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <p>{message.message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {!message.viewed && (
            <Button variant="outline" onClick={markAsViewed}>
              Mark as Viewed
            </Button>
          )}
          <Button variant="destructive" onClick={deleteMessage}>
            Delete Message
          </Button>
        </div>
      </div>
    </div>
  );
}
