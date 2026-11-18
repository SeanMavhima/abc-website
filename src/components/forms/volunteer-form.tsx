"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { submitVolunteer } from "@/lib/actions/forms";
import { INTEREST_OPTIONS, volunteerSchema, type FormResult, type VolunteerInput } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { FormStatus, FormSuccess, useAntiSpam } from "./form-status";

const optionalLabel = <span className="font-normal text-muted-foreground">(optional)</span>;

export function VolunteerForm() {
  const [result, setResult] = React.useState<FormResult | null>(null);
  const antiSpam = useAntiSpam();
  const form = useForm<VolunteerInput>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      interest: "",
      organisation: "",
      availability: "",
      experience: "",
      message: "",
      consent: false as unknown as true,
    },
  });
  const { register, handleSubmit, formState, reset } = form;
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    setResult(null);
    const res = await submitVolunteer({ ...values, ...antiSpam.values() });
    setResult(res);
    if (res.ok) reset();
  });

  if (result?.ok) return <FormSuccess message={result.message} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      {antiSpam.fields}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="vol-name">Full name</Label>
          <Input id="vol-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="vol-email">Email</Label>
          <Input id="vol-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="vol-phone">Phone {optionalLabel}</Label>
          <Input id="vol-phone" type="tel" autoComplete="tel" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="vol-location">Town or country {optionalLabel}</Label>
          <Input id="vol-location" autoComplete="address-level2" {...register("location")} />
          <FieldError message={errors.location?.message} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="vol-interest">I am interested in</Label>
          <Select id="vol-interest" aria-invalid={!!errors.interest} {...register("interest")}>
            <option value="">Choose one</option>
            {INTEREST_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.interest?.message} />
        </div>
        <div>
          <Label htmlFor="vol-org">Organisation or school {optionalLabel}</Label>
          <Input id="vol-org" autoComplete="organization" {...register("organisation")} />
          <FieldError message={errors.organisation?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="vol-availability">Availability {optionalLabel}</Label>
        <Input id="vol-availability" placeholder="For example: weekends, school holidays" {...register("availability")} />
        <FieldError message={errors.availability?.message} />
      </div>
      <div>
        <Label htmlFor="vol-experience">Relevant skills or experience {optionalLabel}</Label>
        <Textarea id="vol-experience" rows={3} {...register("experience")} />
        <FieldError message={errors.experience?.message} />
      </div>
      <div>
        <Label htmlFor="vol-message">Anything else you would like to tell us {optionalLabel}</Label>
        <Textarea id="vol-message" rows={4} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-charcoal/80">
          <Checkbox className="mt-0.5" aria-invalid={!!errors.consent} {...register("consent")} />
          <span>
            I agree that ABC may store these details to respond to my expression of interest, as described in the{" "}
            <Link href="/privacy" className="font-medium underline underline-offset-2 hover:text-forest">
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
        {formState.isSubmitting ? "Sending" : "Submit application"}
      </Button>
    </form>
  );
}
