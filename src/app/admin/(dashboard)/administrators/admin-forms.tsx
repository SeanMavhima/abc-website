"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { createAdministrator, revokeAdministrator } from "@/lib/actions/admin/account";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHelp, Input, Label } from "@/components/ui/form-controls";
import { Panel } from "@/components/admin/editor-layout";
import { ConfirmButton, useAction } from "@/components/admin/primitives";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  fullName: z.string().trim().max(120),
  password: z
    .string()
    .min(12, "Use at least 12 characters.")
    .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), "Include at least one letter and one number."),
});

export function AddAdministrator() {
  const { run } = useAction();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", fullName: "", password: "" } });
  const e = form.formState.errors;
  return (
    <Panel title="Add an administrator" description="They will be able to edit all website content and read form submissions.">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (v) => {
          const res = await run(createAdministrator(v));
          if (res.ok) form.reset();
        })}
      >
        <div>
          <Label htmlFor="a-email">Email</Label>
          <Input id="a-email" type="email" {...form.register("email")} />
          <FieldError message={e.email?.message} />
        </div>
        <div>
          <Label htmlFor="a-name">Name</Label>
          <Input id="a-name" {...form.register("fullName")} />
        </div>
        <div>
          <Label htmlFor="a-pw">Temporary password</Label>
          <Input id="a-pw" type="text" autoComplete="off" {...form.register("password")} />
          <FieldHelp>Share it securely and ask them to change it under My account. If the person already has an account, it is promoted instead and keeps its password.</FieldHelp>
          <FieldError message={e.password?.message} />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />} Add administrator
        </Button>
      </form>
    </Panel>
  );
}

export function RevokeButton({ id, name }: { id: string; name: string }) {
  const { run } = useAction();
  return (
    <ConfirmButton
      title={`Remove administrator access for ${name}?`}
      description="They will no longer be able to sign in to the content manager. Their account is kept."
      confirmLabel="Remove access"
      onConfirm={() => run(revokeAdministrator(id))}
    />
  );
}
