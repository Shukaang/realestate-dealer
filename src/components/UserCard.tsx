"use client";

import { useAuth } from "@/lib/context/AuthContext";
import PageLoader from "./shared/PageLoader";

const UserCard = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="p-4 border rounded">
      <p>
        Signed in as: <strong>{user.email}</strong>
      </p>
    </div>
  );
};

export default UserCard;
