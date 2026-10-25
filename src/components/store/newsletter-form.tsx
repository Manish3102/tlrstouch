"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await subscribeNewsletter({ email });
        toast.success("You're on the list.", {
          description: "Early access to drops and restocks.",
        });
        setEmail("");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not subscribe."
        );
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn("mx-auto flex max-w-md items-end gap-3 border-b border-foreground", className)}
    >
      <div className="flex-1">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="h-12 border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="sm" variant="ghost" disabled={pending} className="mb-1 px-0">
        {pending ? "Joining" : "Join"}
      </Button>
    </form>
  );
}
