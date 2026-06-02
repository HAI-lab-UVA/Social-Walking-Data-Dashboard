"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "../firebase-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await logout();
      const success = await login(email, password);
      if (success) {
        router.push("./dashboard");
      }
    } catch (error) {
      if (typeof error === "string") {
        setError(error);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col w-300px gap-3">
        <h2 className="text-center">Social Walking Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-white text-black py-2 px-4 rounded-full"
        />

        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-white text-black py-2 px-4 rounded-full"
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
        >
          Log In
        </button>

        {error && <p className="text-center text-rose-500">{error}</p>}
      </form>
    </div>
  );
}
