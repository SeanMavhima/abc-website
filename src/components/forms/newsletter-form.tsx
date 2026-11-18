"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/actions/forms";
import { newsletterSchema, type FormResult, type NewsletterInput } from "@/lib/validation/forms";
import { useAntiSpam } from "./form-status";

export function NewsletterForm() {
  const [result, setResult] = React.useState<FormResult | null>(null);
  const antiSpam = useAntiSpam();
  const { register, handleSubmit, formState, reset } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setResult(null);
    const res = await subscribeNewsletter({ ...values, ...antiSpam.values() });
    setResult(res);
    if (res.ok) reset();
  });

  if (result?.ok) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-sage">
        <CheckCircle2 className="size-5" /> {result.message}
      </p>
    );
  }

  const error = formState.errors.email?.message ?? (result && !result.ok ? result.message : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      {antiSpam.fields}
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex rounded-full bg-white/8 p-1.5 ring-1 ring-white/15 transition focus-within:ring-sage">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:outline-none"
          {...register("email")}
        />
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-forest transition hover:bg-white disabled:opacity-60"
        >
          {formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          <span className="hidden sm:inline">Subscribe</span>
          <span className="sr-only sm:hidden">Subscribe</span>
        </button>
      </div>
      {error ? (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}
    </form>
  );
}
