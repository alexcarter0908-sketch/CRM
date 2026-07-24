import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold">My CRM</h1>
      <p className="max-w-md text-gray-600">
        Manage your contacts, sales pipeline, and follow-ups in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-brand px-6 py-3 text-white hover:bg-brand-dark"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
