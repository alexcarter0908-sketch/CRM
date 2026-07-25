"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setToken(token);
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [params, router]);

  return <p className="text-gray-500">Signing you in...</p>;
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<p className="text-gray-500">Signing you in...</p>}>
        <AuthCallbackInner />
      </Suspense>
    </main>
  );
}
