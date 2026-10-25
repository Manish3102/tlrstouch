"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(searchParams.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 border border-neutral-200 bg-white p-8"
      >
        <div>
          <p className="font-display text-3xl tracking-tight">Tailorstouch</p>
          <h1 className="mt-2 text-lg font-medium">Admin sign in</h1>
        </div>
        <label className="block space-y-1.5 text-sm">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-neutral-200 px-3 py-2.5"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-neutral-200 px-3 py-2.5"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 py-3 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F5]" />}>
      <LoginForm />
    </Suspense>
  );
}
