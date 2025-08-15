"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import AdminNavbar from "@/components/admin/admin-navbar";
import { toast } from "sonner";
import PageLoader from "@/components/shared/page-loader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, hasPermission } = useAuth();
  const router = useRouter();

  // 🔐 Permission Guard
  useEffect(() => {
    if (!loading && user && role) {
      const currentPath = window.location.pathname;
      const allowedPaths = {
        "/admin/dashboard": "view-dashboard",
        "/admin/upload": "upload-content",
        "/admin/settings": "manage-admins",
        // Add other paths
      };

      const requiredPermission =
        allowedPaths[currentPath as keyof typeof allowedPaths];

      if (requiredPermission && !hasPermission(requiredPermission)) {
        toast.error("Permission denied");
        router.replace("/admin");
      }
    }
  }, [user, role, loading, hasPermission, router]);

  // 🔐 Auth Guard
  useEffect(() => {
    if (!loading && (!user || !role)) {
      router.replace("/admin/login");
    }
  }, [user, role, loading, router]);

  // Show loading spinner until we know auth status
  if (loading || !user || !role) return <PageLoader />;

  return (
    <>
      <AdminNavbar />
      <div>{children}</div>
    </>
  );
}
