"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(fullName, email, password);
      }
      const { access_token } = await api.login(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">
          {isRegister ? "Create an account" : "Log in"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Sign up" : "Login"}
          </button>
        </form>

        <a
          href={`${API_URL}/auth/google/login`}
          className="mt-3 block rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
        >
          Log in with Google
        </a>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="mt-4 text-sm text-brand hover:underline"
        >
          {isRegister ? "Already have an account? Log in" : "Create a new account"}
        </button>
      </div>
    </main>
  );
}
