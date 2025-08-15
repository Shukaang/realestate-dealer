"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  PlusCircle,
  Users,
  Shield,
  Eye,
  Settings,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Unauthorized } from "@/components/admin/unauthorized";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: any;
  createdBy?: string;
}

type AdminRole = "super-admin" | "admin" | "moderator" | "viewer";

const roleConfig = {
  "super-admin": {
    label: "Super Admin",
    color: "destructive" as const,
    icon: Shield,
  },
  admin: { label: "Admin", color: "default" as const, icon: Settings },
  moderator: { label: "Moderator", color: "secondary" as const, icon: Users },
  viewer: { label: "Viewer", color: "outline" as const, icon: Eye },
};

export default function AdminManagementPage() {
  const router = useRouter();
  const { user, role, hasPermission, getIdToken } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Sort and group admins
  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => {
      // Main admin always first
      if (a.createdBy === "main admin" && b.createdBy !== "main admin")
        return -1;
      if (b.createdBy === "main admin" && a.createdBy !== "main admin")
        return 1;

      // Then super-admins
      const aIsSuper = a.role === "super-admin";
      const bIsSuper = b.role === "super-admin";
      if (aIsSuper && !bIsSuper) return -1;
      if (bIsSuper && !aIsSuper) return 1;

      // Then sort alphabetically
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [admins]);

  // Real-time admin data fetching
  useEffect(() => {
    if (!hasPermission("manage-admins")) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "admins"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const adminData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Admin[];
        setAdmins(adminData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading admin data:", error);
        toast.error("Failed to load admin data");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hasPermission]);

  if (!hasPermission("manage-admins")) {
    return <Unauthorized />;
  }

  // Find main admin
  const mainAdmin = admins.find((admin) => admin.createdBy === "main admin");
  const isMainAdmin = user?.uid === mainAdmin?.id;

  const handleDeleteConfirm = async (adminToDelete: Admin) => {
    if (!adminToDelete) return;

    setIsDeleting(true);
    try {
      const idToken = await getIdToken(true);
      if (!idToken) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ adminId: adminToDelete.id }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP ${response.status}: Admin deletion failed`
        );
      }

      toast.success("Admin deleted successfully");
      setDeletingAdmin(null);
    } catch (error: any) {
      console.error("Admin deletion failed:", error);
      toast.error(error.message || "Failed to delete admin");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleUpdate = async (adminId: string, newRole: AdminRole) => {
    setUpdatingRole(adminId);
    try {
      const idToken = await getIdToken(true);
      if (!idToken) {
        throw new Error("Authentication token not available");
      }

      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ adminId, newRole }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP ${response.status}: Role update failed`
        );
      }

      toast.success("Admin's role updated successfully");
    } catch (error: any) {
      console.error("Role update failed:", error);
      toast.error(error.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleStats = () => {
    const stats = admins.reduce((acc, admin) => {
      acc[admin.role as AdminRole] = (acc[admin.role as AdminRole] || 0) + 1;
      return acc;
    }, {} as Record<AdminRole, number>);
    return stats;
  };

  const roleStats = getRoleStats();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-800">
      <div className="container bg-white dark:bg-slate-800 mx-auto px-5 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">
              Manage admin users and their permissions
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin/settings/create-admin")}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Admin
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(roleConfig).map(([roleKey, config]) => {
            const count = roleStats[roleKey as AdminRole] || 0;
            const Icon = config.icon;
            return (
              <Card key={roleKey} className="dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {config.label}s
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Table */}
        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>
              View and manage all admin users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No admin users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAdmins.map((admin) => {
                    const roleInfo = roleConfig[admin.role as AdminRole];
                    const isCurrentUser = admin.id === user?.uid;
                    const isMainAdminUser = admin.createdBy === "main admin";
                    const isSuperAdmin = admin.role === "super-admin";

                    // Permission checks
                    const canEditRole =
                      !isCurrentUser &&
                      (isMainAdmin ||
                        (role === "super-admin" && !isSuperAdmin));

                    const canDelete =
                      !isCurrentUser &&
                      (isMainAdmin ||
                        (role === "super-admin" && !isSuperAdmin));

                    return (
                      <TableRow
                        key={admin.id}
                        className="dark:hover:bg-slate-800"
                      >
                        <TableCell className="font-medium">
                          {admin.firstName} {admin.lastName}
                          {isCurrentUser && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs bg-green-200 dark:bg-slate-800"
                            >
                              You
                            </Badge>
                          )}
                          {isMainAdminUser && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Main Admin
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500">
                            By: {admin.createdBy}
                          </p>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {canEditRole ? (
                            <Select
                              value={admin.role}
                              onValueChange={(value: AdminRole) =>
                                handleRoleUpdate(admin.id, value)
                              }
                              disabled={updatingRole === admin.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                                {updatingRole === admin.id && (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleConfig)
                                  .filter(
                                    ([roleKey]) =>
                                      // Only main admin can assign super-admin
                                      isMainAdmin || roleKey !== "super-admin"
                                  )
                                  .map(([roleKey, config]) => (
                                    <SelectItem key={roleKey} value={roleKey}>
                                      {config.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={roleInfo?.color || "default"}>
                              {roleInfo?.label || admin.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {admin.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive p-2 bg-red-50 hover:bg-red-100 dark:bg-red-100 dark:hover:bg-red-200"
                                  onClick={() => setDeletingAdmin(admin)}
                                  disabled={isMainAdminUser} // Disable for main admin
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Admin User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                      {admin.firstName} {admin.lastName}
                                    </strong>
                                    ? This action cannot be undone and will
                                    permanently remove their access.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeletingAdmin(null)}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteConfirm(admin)}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Delete Admin
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
