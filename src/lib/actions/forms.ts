"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getPublicClient } from "@/lib/supabase/public";
import {
  antiSpamSchema,
  contactSchema,
  newsletterSchema,
  observationSchema,
  volunteerSchema,
  type FormResult,
} from "@/lib/validation/forms";

const MIN_FILL_MS = 2500; // humans take longer than this to complete a form
const MAX_FILL_MS = 1000 * 60 * 60 * 24;

async function ipHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.FORM_HASH_SALT || "abc-default-salt-change-me";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Returns an error result when the request looks automated. */
function checkSpam(raw: unknown): FormResult | null {
  const parsed = antiSpamSchema.safeParse(raw);
  // Bots that fill the honeypot get a generic "success" so they learn nothing.
  if (!parsed.success) return { ok: true, message: "Thank you. Your message has been received." };
  const elapsed = Date.now() - parsed.data.startedAt;
  if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return { ok: false, message: "Please take a moment to review your details, then submit again." };
  }
  return null;
}

async function submit(kind: "contact" | "volunteer" | "newsletter" | "observation", data: Record<string, unknown>): Promise<FormResult> {
  const sb = getPublicClient();
  if (!sb) {
    return {
      ok: false,
      message:
        "This form is not connected yet: the website is running in development preview mode without a database. Nothing was sent.",
    };
  }
  const { data: result, error } = await sb.rpc("submit_form", { p_kind: kind, p_data: data, p_ip_hash: await ipHash() });
  if (error) {
    console.error("[forms] submit failed", error);
    return { ok: false, message: "Sorry, something went wrong while sending. Please try again later." };
  }
  if (result === "closed") {
    return { ok: false, message: "Observation submissions are not open at the moment. Nothing was sent." };
  }
  if (result === "rate_limited") {
    return { ok: false, message: "We have received several submissions from your connection. Please try again in a few minutes." };
  }
  return { ok: true, message: "" };
}

export async function submitContact(raw: Record<string, unknown>): Promise<FormResult> {
  const spam = checkSpam(raw);
  if (spam) return spam;
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  const res = await submit("contact", parsed.data);
  return res.ok ? { ok: true, message: "Thank you for getting in touch. We will reply as soon as we can." } : res;
}

export async function submitVolunteer(raw: Record<string, unknown>): Promise<FormResult> {
  const spam = checkSpam(raw);
  if (spam) return spam;
  const parsed = volunteerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { consent, ...data } = parsed.data;
  const res = await submit("volunteer", data);
  return res.ok
    ? { ok: true, message: "Thank you for your interest in ABC. We have received your details and will be in touch as opportunities develop." }
    : res;
}

export async function subscribeNewsletter(raw: Record<string, unknown>): Promise<FormResult> {
  const spam = checkSpam(raw);
  if (spam) return spam;
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please enter a valid email." };
  const res = await submit("newsletter", parsed.data);
  return res.ok ? { ok: true, message: "Thank you for subscribing." } : res;
}

/** Community observation. Stored as "pending": nothing is public until an administrator approves it. */
export async function submitObservation(raw: Record<string, unknown>): Promise<FormResult> {
  const spam = checkSpam(raw);
  if (spam) return spam;
  const parsed = observationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  const res = await submit("observation", parsed.data);
  return res.ok
    ? { ok: true, message: "Thank you. Your observation has been received and will be reviewed before it is published." }
    : res;
}
