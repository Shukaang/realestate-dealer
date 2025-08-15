"use client";

import { useState, useMemo } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  EyeOff,
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
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { mutate } from "swr";
import { useAuth } from "@/lib/context/AuthContext";

interface UserMessage {
  id: string;
  viewed: boolean;
  createdAt: any;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export default function AdminUserMessagesPage() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const { data: messagesData = [], isLoading } =
    useFirestoreCollection<UserMessage>("userMessages");

  // Check permissions
  const canUpdate = ["super-admin", "admin", "moderator"].includes(role || "");
  const canDelete = role === "super-admin";

  // Get filter from URL
  const filter = useMemo(() => {
    const param = searchParams.get("filter");
    return param === "viewed" || param === "unviewed" ? param : "all";
  }, [searchParams]);

  // Handle filter change with URL update
  const handleFilterChange = (newFilter: "all" | "viewed" | "unviewed") => {
    const params = new URLSearchParams(searchParams);
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messagesData
      .filter((msg) =>
        filter === "all" ? true : filter === "viewed" ? msg.viewed : !msg.viewed
      )
      .filter((msg) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          msg.firstName?.toLowerCase().includes(searchLower) ||
          msg.lastName?.toLowerCase().includes(searchLower) ||
          msg.email?.toLowerCase().includes(searchLower) ||
          msg.subject?.toLowerCase().includes(searchLower) ||
          msg.message?.toLowerCase().includes(searchLower)
        );
      });
  }, [messagesData, filter, searchQuery]);

  const markAsViewed = async (id: string) => {
    try {
      await updateDoc(doc(db, "userMessages", id), { viewed: true });
      mutate("userMessages");
      toast.success("Marked as viewed");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const markAsUnviewed = async (id: string) => {
    try {
      await updateDoc(doc(db, "userMessages", id), { viewed: false });
      mutate("userMessages");
      toast.success("Marked as unviewed");
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
      mutate("userMessages");
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  // Stats calculations
  const totalMessages = messagesData.length;
  const unviewedMessages = messagesData.filter((msg) => !msg.viewed).length;
  const viewedMessages = totalMessages - unviewedMessages;

  return (
    <section className="bg-white dark:bg-slate-800">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-slate-900 dark:to-blue-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                {totalMessages}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-blue-950 dark:to-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Unviewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-200">
                {unviewedMessages}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-slate-900 dark:to-blue-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                Viewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">
                {viewedMessages}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-lg dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                  User Messages
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage and respond to user inquiries
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 bg-white/90 backdrop-blur-sm dark:bg-slate-800 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Filter Chips */}
            <div className="p-4 border-b flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange("all")}
                className="rounded-full gap-2"
              >
                <Mail className="w-4 h-4" />
                All
              </Button>
              <Button
                variant={filter === "unviewed" ? "default" : "outline"}
                onClick={() => handleFilterChange("unviewed")}
                className="rounded-full gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Unviewed
              </Button>
              <Button
                variant={filter === "viewed" ? "default" : "outline"}
                onClick={() => handleFilterChange("viewed")}
                className="rounded-full gap-2"
              >
                <Eye className="w-4 h-4" />
                Viewed
              </Button>
            </div>

            {/* Messages List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <CardFooter className="rounded-b-lg px-4 py-3 bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">{filteredMessages.length}</span>{" "}
                  of <span className="font-medium">{totalMessages}</span>{" "}
                  messages
                </p>
              </CardFooter>

              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                </div>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                        <AvatarFallback>
                          {getInitials(msg.firstName, msg.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Link
                              href={`/admin/usermessages/${msg.id}`}
                              className="font-semibold hover:underline text-slate-800 dark:text-white"
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
                                className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              >
                                Viewed
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="dark:bg-red-900/30"
                              >
                                Unviewed
                              </Badge>
                            )}

                            {(canUpdate || canDelete) && (
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
                                  {canUpdate && (
                                    <>
                                      {!msg.viewed ? (
                                        <DropdownMenuItem
                                          onClick={() => markAsViewed(msg.id)}
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          Mark as Viewed
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => markAsUnviewed(msg.id)}
                                        >
                                          <EyeOff className="mr-2 h-4 w-4" />
                                          Mark as Unviewed
                                        </DropdownMenuItem>
                                      )}
                                    </>
                                  )}
                                  {canDelete && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(msg.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        <h3 className="mt-2 font-semibold text-slate-800 dark:text-white">
                          {msg.subject}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {msg.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {msg.createdAt?.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
                    No messages found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {searchQuery
                      ? "Try a different search term"
                      : "No messages have been sent yet"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-white">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-slate-400">
                This action cannot be undone. The message will be permanently
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete Message
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
