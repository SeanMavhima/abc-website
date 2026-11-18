"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { submitObservation } from "@/lib/actions/forms";
import { OBSERVATION_CATEGORIES } from "@/lib/status";
import { observationSchema, type FormResult, type ObservationInput } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, FieldHelp, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { FormStatus, FormSuccess, useAntiSpam } from "./form-status";

/**
 * Community observation form. Submissions are held for review: nothing is
 * shown publicly until an administrator approves it. Only a general area is
 * asked for, never a precise location.
 */
export function ObservationForm() {
  const [result, setResult] = React.useState<FormResult | null>(null);
  const antiSpam = useAntiSpam();
  const { register, handleSubmit, formState, reset } = useForm<ObservationInput>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      category: "bird",
      what: "",
      notes: "",
      general_area: "",
      observed_on: "",
      observer_name: "",
      observer_email: "",
      credit_name: false,
      is_minor: false,
      consent: false as unknown as true,
    },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    setResult(null);
    const res = await submitObservation({ ...values, ...antiSpam.values() });
    setResult(res);
    if (res.ok) reset();
  });

  if (result?.ok) return <FormSuccess message={result.message} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      {antiSpam.fields}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="obs-category">What kind of observation?</Label>
          <Select id="obs-category" aria-invalid={!!errors.category} {...register("category")}>
            {OBSERVATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.category?.message} />
        </div>
        <div>
          <Label htmlFor="obs-date">
            Date seen <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="obs-date" type="date" aria-invalid={!!errors.observed_on} {...register("observed_on")} />
          <FieldError message={errors.observed_on?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="obs-what">What did you see?</Label>
        <Input id="obs-what" placeholder="For example: two grey crowned cranes" aria-invalid={!!errors.what} {...register("what")} />
        <FieldHelp>Use the name you know it by. If you are not sure what it was, describe it.</FieldHelp>
        <FieldError message={errors.what?.message} />
      </div>
      <div>
        <Label htmlFor="obs-notes">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="obs-notes" rows={4} placeholder="What was it doing? What was the habitat like?" {...register("notes")} />
        <FieldError message={errors.notes?.message} />
      </div>
      <div>
        <Label htmlFor="obs-area">
          General area <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="obs-area" placeholder="For example: a district or the nearest town" {...register("general_area")} />
        <FieldHelp>Please do not give a precise location. This protects sensitive species and your own privacy.</FieldHelp>
        <FieldError message={errors.general_area?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="obs-name">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="obs-name" autoComplete="name" {...register("observer_name")} />
          <FieldError message={errors.observer_name?.message} />
        </div>
        <div>
          <Label htmlFor="obs-email">
            Email <span className="font-normal text-muted-foreground">(optional, never published)</span>
          </Label>
          <Input id="obs-email" type="email" autoComplete="email" aria-invalid={!!errors.observer_email} {...register("observer_email")} />
          <FieldError message={errors.observer_email?.message} />
        </div>
      </div>
      <div className="space-y-3 rounded-md bg-forest/5 p-4">
        <label className="flex items-start gap-3 text-sm text-charcoal/85">
          <Checkbox className="mt-0.5" {...register("credit_name")} />
          <span>Credit me by name if this observation is published.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-charcoal/85">
          <Checkbox className="mt-0.5" {...register("is_minor")} />
          <span>This observation was made by someone under 18. I am their parent, guardian or teacher. (Their name will not be published.)</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-charcoal/85">
          <Checkbox className="mt-0.5" aria-invalid={!!errors.consent} {...register("consent")} />
          <span>
            I agree that ABC may review this observation and publish it, without my contact details, as described in the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-forest">
              privacy policy
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.consent?.message} />
      </div>
      <FormStatus result={result} />
      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        {formState.isSubmitting ? "Sending" : "Send for review"}
      </Button>
    </form>
  );
}
