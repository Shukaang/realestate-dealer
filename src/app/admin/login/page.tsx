"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const q = query(collection(db, "admins"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Access denied: Not an admin");
        await auth.signOut();
      } else {
        router.push("/admin");
      }
    } catch (error: any) {
      setError(
        error.message.includes("auth/")
          ? "Invalid email or password"
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-800 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-slate-900 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl dark:text-gray-400 font-bold mb-6 text-center">
          Admin Login
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 dark:text-gray-300 py-2 mb-4 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 dark:text-gray-300 py-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-700 text-white dark:text-gray-300 py-2 rounded hover:bg-blue-800 flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            "Login as Admin"
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
