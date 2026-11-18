import { z } from "zod";

export const INTEREST_OPTIONS = [
  { value: "volunteer", label: "Volunteering" },
  { value: "youth_researcher", label: "Becoming a youth researcher" },
  { value: "research_collaboration", label: "Research collaboration" },
  { value: "partnership", label: "Institutional partnership" },
  { value: "nature_labs", label: "Supporting community Nature Labs" },
  { value: "community_engagement", label: "Community engagement" },
  { value: "other", label: "Something else" },
] as const;

export const interestLabel = (value: string) => INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? value;

const email = z.string().trim().min(1, "Please enter your email address.").max(320).email("Please enter a valid email address.");
const optional = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`).optional().default("");

/** Anti-spam fields included with every public form. */
export const antiSpamSchema = z.object({
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  startedAt: z.number().int().positive(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email,
  organisation: optional(200),
  subject: optional(200),
  message: z.string().trim().min(10, "Please write a message of at least 10 characters.").max(5000),
});
export type ContactInput = z.input<typeof contactSchema>;

export const volunteerSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email,
  phone: optional(50),
  location: optional(200),
  interest: z.enum(INTEREST_OPTIONS.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Please choose an area of interest." }),
  }),
  organisation: optional(200),
  availability: optional(500),
  experience: optional(3000),
  message: optional(5000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm that we may use these details to respond." }) }),
});
export type VolunteerInput = z.input<typeof volunteerSchema>;

export const newsletterSchema = z.object({ email });
export type NewsletterInput = z.input<typeof newsletterSchema>;

export type FormResult = { ok: true; message: string } | { ok: false; message: string };

const OBSERVATION_KINDS = ["bird", "plant", "insect", "mammal", "amphibian_reptile", "fungus", "habitat", "other"] as const;

export const observationSchema = z.object({
  category: z.enum(OBSERVATION_KINDS, { errorMap: () => ({ message: "Please choose what kind of observation this is." }) }),
  what: z.string().trim().min(2, "Please say what you saw.").max(200),
  notes: optional(3000),
  // A general area only. Precise locations are never collected.
  general_area: optional(120),
  observed_on: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v).getTime() <= Date.now() + 86400000), "Please enter a date that is not in the future.")
    .optional()
    .default(""),
  observer_name: optional(120),
  observer_email: z.union([z.literal(""), email]).optional().default(""),
  credit_name: z.boolean().optional().default(false),
  is_minor: z.boolean().optional().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm that ABC may review and publish this observation." }) }),
});
export type ObservationInput = z.input<typeof observationSchema>;
