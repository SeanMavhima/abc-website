"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-8">
      <TriangleAlert className="size-6 text-destructive" />
      <h1 className="mt-4 font-display text-xl font-semibold">This page could not be loaded</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred."} If this mentions a missing table or permission, check that all SQL
        migrations have been run and that your account has the admin role.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
