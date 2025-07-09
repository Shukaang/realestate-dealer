"use client";

import { Loader2 } from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Trash2,
  Mail,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminUserMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "viewed" | "unviewed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "userMessages"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(data);
      } catch (error) {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const markAsViewed = async (id: string) => {
    try {
      await updateDoc(doc(db, "userMessages", id), { viewed: true });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, viewed: true } : m))
      );
      toast.success("Marked as viewed");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const handleDeleteClick = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteDoc(doc(db, "userMessages", messageToDelete));
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const filteredMessages = messages
    .filter((m) =>
      filter === "all" ? true : filter === "viewed" ? m.viewed : !m.viewed
    )
    .filter((m) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        m.firstName?.toLowerCase().includes(searchLower) ||
        m.lastName?.toLowerCase().includes(searchLower) ||
        m.email?.toLowerCase().includes(searchLower) ||
        m.subject?.toLowerCase().includes(searchLower) ||
        m.message?.toLowerCase().includes(searchLower)
      );
    });

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {messages.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Unviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {messages.filter((m) => !m.viewed).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Viewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {messages.filter((m) => m.viewed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-100 dark:bg-gray-900 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold dark:text-gray-300 text-slate-900">
                User Messages
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage and respond to user inquiries
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10 bg-white/90 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Filter Chips */}
          <div className="p-4 border-b flex flex-wrap items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-full gap-2"
            >
              <Mail className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={filter === "unviewed" ? "default" : "outline"}
              onClick={() => setFilter("unviewed")}
              className="rounded-full gap-2"
            >
              <Eye className="w-4 h-4" />
              Unviewed
            </Button>
            <Button
              variant={filter === "viewed" ? "default" : "outline"}
              onClick={() => setFilter("viewed")}
              className="rounded-full gap-2"
            >
              Viewed
            </Button>
          </div>

          {/* Messages List */}
          <div className="divide-y">
            {loading ? (
              <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
              </div>
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="bg-purple-100 dark:bg-purple-200 text-purple-800">
                      <AvatarFallback>
                        {getInitials(msg.firstName, msg.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link
                            href={`/admin/usermessages/${msg.id}`}
                            className="font-semibold hover:underline text-gray-900 dark:text-gray-200"
                          >
                            {msg.firstName} {msg.lastName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {msg.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.viewed ? (
                            <Badge
                              variant="outline"
                              className="border-green-200 text-green-800"
                            >
                              Viewed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Unviewed</Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!msg.viewed && (
                                <DropdownMenuItem
                                  onClick={() => markAsViewed(msg.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Mark as Viewed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(msg.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <h3 className="mt-2 font-medium text-gray-900 dark:text-gray-200">
                        {msg.subject}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {msg.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No messages found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try a different search term"
                    : "No messages have been sent yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="rounded-b-lg px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">{filteredMessages.length}</span> of{" "}
            <span className="font-medium">{messages.length}</span> messages
          </p>
        </CardFooter>
      </Card>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            >
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
