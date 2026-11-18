"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { signIn, type LoginState } from "@/lib/actions/admin/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {notice && !state?.error ? <p className="rounded-lg bg-sky-50 px-3 py-2.5 text-sm text-sky-900">{notice}</p> : null}
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/admin/forgot-password" className="mb-1.5 text-xs font-medium text-evergreen hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />} Sign in
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        There is no public registration. New administrators are added by an existing administrator.
      </p>
    </form>
  );
}
