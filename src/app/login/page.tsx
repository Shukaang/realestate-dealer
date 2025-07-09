"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/firebase";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-6 font-bold">Login</h2>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-blue-500 text-white py-2 rounded">
          Log In
        </button>
      </form>

      <p className="text-sm mt-4">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-500 underline">
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
