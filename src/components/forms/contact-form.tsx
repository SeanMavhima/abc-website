"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { submitContact } from "@/lib/actions/forms";
import { contactSchema, type ContactInput, type FormResult } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/form-controls";
import { FormStatus, FormSuccess, useAntiSpam } from "./form-status";

export function ContactForm() {
  const [result, setResult] = React.useState<FormResult | null>(null);
  const antiSpam = useAntiSpam();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", organisation: "", subject: "", message: "" },
  });
  const { register, handleSubmit, formState, reset } = form;
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    setResult(null);
    const res = await submitContact({ ...values, ...antiSpam.values() });
    setResult(res);
    if (res.ok) reset();
  });

  if (result?.ok) return <FormSuccess message={result.message} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      {antiSpam.fields}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-org">
            Organisation <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="contact-org" autoComplete="organization" {...register("organisation")} />
          <FieldError message={errors.organisation?.message} />
        </div>
        <div>
          <Label htmlFor="contact-subject">
            Subject <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="contact-subject" {...register("subject")} />
          <FieldError message={errors.subject?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" rows={6} aria-invalid={!!errors.message} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>
      <FormStatus result={result} />
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          We use these details only to reply to you. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-forest">
            privacy policy
          </Link>
          .
        </p>
        <Button type="submit" size="lg" disabled={formState.isSubmitting} className="shrink-0">
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          {formState.isSubmitting ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
