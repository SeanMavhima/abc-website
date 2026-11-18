"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2, Save } from "lucide-react";
import { updatePassword, updateProfile } from "@/lib/actions/admin/account";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHelp, Input, Label } from "@/components/ui/form-controls";
import { Panel } from "@/components/admin/editor-layout";
import { useAction } from "@/components/admin/primitives";

const profileSchema = z.object({ fullName: z.string().trim().max(120) });
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use at least 12 characters.")
      .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), "Include at least one letter and one number."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export function AccountForms({ email, fullName, lastSignIn }: { email: string; fullName: string; lastSignIn: string | null }) {
  const { run } = useAction();
  const profile = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { fullName } });
  const pw = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirm: "" } });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Profile">
        <form
          className="space-y-5"
          onSubmit={profile.handleSubmit(async (v) => {
            await run(updateProfile(v.fullName));
          })}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
            {lastSignIn ? <FieldHelp>Last signed in {formatDateTime(lastSignIn)}</FieldHelp> : null}
          </div>
          <div>
            <Label htmlFor="fullName">Display name</Label>
            <Input id="fullName" {...profile.register("fullName")} />
            <FieldError message={profile.formState.errors.fullName?.message} />
          </div>
          <Button type="submit" disabled={profile.formState.isSubmitting}>
            {profile.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save profile
          </Button>
        </form>
      </Panel>
      <Panel title="Change password">
        <form
          className="space-y-5"
          onSubmit={pw.handleSubmit(async (v) => {
            const res = await run(updatePassword(v.password), { refresh: false });
            if (res.ok) pw.reset();
          })}
        >
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...pw.register("password")} />
            <FieldHelp>At least 12 characters, including a letter and a number.</FieldHelp>
            <FieldError message={pw.formState.errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...pw.register("confirm")} />
            <FieldError message={pw.formState.errors.confirm?.message} />
          </div>
          <Button type="submit" disabled={pw.formState.isSubmitting}>
            {pw.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />} Update password
          </Button>
        </form>
      </Panel>
    </div>
  );
}
