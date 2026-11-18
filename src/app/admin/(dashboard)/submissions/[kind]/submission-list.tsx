"use client";

import * as React from "react";
import { ChevronDown, Mail } from "lucide-react";
import { deleteSubmission, setSubmissionStatus, type SubmissionKind } from "@/lib/actions/admin/submissions";
import { interestLabel } from "@/lib/validation/forms";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmButton, useAction } from "@/components/admin/primitives";

type Row = Record<string, string | null> & { id: string; status: string; created_at: string; email: string };

const STATUS_STYLE: Record<string, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  reviewed: "bg-amber-50 text-amber-800 ring-amber-200",
  resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  subscribed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  unsubscribed: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

const DETAIL_FIELDS: Record<SubmissionKind, [string, string][]> = {
  contact: [
    ["organisation", "Organisation"],
    ["subject", "Subject"],
    ["message", "Message"],
  ],
  volunteer: [
    ["interest", "Interest"],
    ["phone", "Phone"],
    ["location", "Location"],
    ["organisation", "Organisation"],
    ["availability", "Availability"],
    ["experience", "Skills and experience"],
    ["message", "Message"],
  ],
  newsletter: [],
};

export function SubmissionList({ kind, items, statuses }: { kind: SubmissionKind; items: Row[]; statuses: string[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  const { run, pending } = useAction();

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
      {items.map((item) => {
        const expanded = open === item.id;
        const summary =
          kind === "contact" ? item.subject || item.message?.slice(0, 80) : kind === "volunteer" ? interestLabel(item.interest ?? "") : "";
        return (
          <li key={item.id} className={cn(item.status === "new" && "bg-sky-50/30")}>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
              {kind !== "newsletter" ? (
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : item.id)}
                  aria-expanded={expanded}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                  <span className="min-w-0">
                    <span className={cn("block truncate text-sm", item.status === "new" ? "font-semibold" : "font-medium")}>
                      {item.name} <span className="font-normal text-muted-foreground">&lt;{item.email}&gt;</span>
                    </span>
                    {summary ? <span className="block truncate text-xs text-muted-foreground">{summary}</span> : null}
                  </span>
                </button>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.email}</span>
              )}
              <span className="text-xs whitespace-nowrap text-muted-foreground">{formatDateTime(item.created_at)}</span>
              <select
                value={item.status}
                disabled={pending}
                aria-label="Status"
                onChange={(e) => run(setSubmissionStatus(kind, item.id, e.target.value))}
                className={cn("h-8 rounded-full px-3 text-xs font-semibold capitalize ring-1 ring-inset", STATUS_STYLE[item.status])}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ConfirmButton
                title="Delete this submission?"
                description="The personal information in this record will be permanently deleted."
                onConfirm={() => run(deleteSubmission(kind, item.id))}
              />
            </div>
            {expanded ? (
              <div className="border-t border-border bg-muted/20 px-4 py-5 sm:px-11">
                <dl className="grid gap-4 sm:grid-cols-2">
                  {DETAIL_FIELDS[kind].map(([key, label]) =>
                    item[key] ? (
                      <div key={key} className={cn(["message", "experience"].includes(key) && "sm:col-span-2")}>
                        <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
                        <dd className="mt-1 text-sm whitespace-pre-wrap">{key === "interest" ? interestLabel(item[key] ?? "") : item[key]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
                <Button asChild variant="outline" size="sm" className="mt-5">
                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent(
                      kind === "contact" ? `Re: ${item.subject || "your message to ABC"}` : "Your interest in ABC",
                    )}`}
                  >
                    <Mail /> Reply by email
                  </a>
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
