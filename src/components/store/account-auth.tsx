"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");

    try {
      if (mode === "create") {
        await registerCustomer({ name, email, password });
      }

      const result = await signIn("credentials", {
        email,
        password,
        intent: "customer",
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "create"
            ? "Account created, but sign in failed. Try signing in."
            : "Invalid email or password"
        );
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {mode === "sign-in"
          ? "Sign in to keep your wishlist and orders in one place."
          : "Use the email you want on your orders."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {mode === "create" ? (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required minLength={2} autoComplete="name" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "create" ? "new-password" : "current-password"}
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-6 text-sm underline"
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "create" : "sign-in"));
          setError("");
        }}
      >
        {mode === "sign-in"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
