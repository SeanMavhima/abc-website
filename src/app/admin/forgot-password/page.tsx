"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/admin/account";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/form-controls";
import { LogoMark } from "@/components/site/logo";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export default function ForgotPasswordPage() {
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    const res = await requestPasswordReset(email);
    setMessage(res.ok ? { ok: true, text: res.message ?? "Check your email." } : { ok: false, text: res.error });
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <LogoMark className="size-11 text-evergreen" />
        <h1 className="mt-6 font-display text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We will email a secure link to set a new password.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          {message ? (
            <p role="status" className={message.ok ? "rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900" : "rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800"}>
              {message.text}
            </p>
          ) : null}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!formState.errors.email} {...register("email")} />
            <FieldError message={formState.errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Mail />} Send reset link
          </Button>
          <Link href="/admin/login" className="block text-center text-sm font-medium text-evergreen hover:underline">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
