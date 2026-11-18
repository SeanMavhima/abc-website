import { cn } from "@/lib/utils";

/** Two-column editor: main content on the left, settings panels on the right. */
export function EditorLayout({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">{main}</div>
      <aside className="space-y-6 lg:col-span-4">{side}</aside>
    </div>
  );
}

export function Panel({ title, children, className, description }: { title: string; children: React.ReactNode; className?: string; description?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-white p-5 shadow-xs sm:p-6", className)}>
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}
