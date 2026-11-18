"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2 } from "lucide-react";
import { updatePassword } from "@/lib/actions/admin/account";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHelp, Input, Label } from "@/components/ui/form-controls";
import { LogoMark } from "@/components/site/logo";

const schema = z
  .object({
    password: z.string().min(12, "Use at least 12 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null);
    const res = await updatePassword(password);
    if (res.ok) router.push("/admin");
    else setError(res.error);
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <LogoMark className="size-11 text-evergreen" />
        <h1 className="mt-6 font-display text-2xl font-bold">Choose a new password</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            <FieldHelp>At least 12 characters, including a letter and a number.</FieldHelp>
            <FieldError message={formState.errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
            <FieldError message={formState.errors.confirm?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />} Save password
          </Button>
        </form>
      </div>
    </div>
  );
}
