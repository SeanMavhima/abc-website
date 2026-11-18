"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[80vh] items-center bg-forest pt-32 pb-20 text-white">
      <div className="container-site max-w-2xl">
        <p className="eyebrow text-sage">Something went wrong</p>
        <h1 className="mt-4 font-display text-4xl font-medium sm:text-5xl">We could not load this page</h1>
        <p className="mt-5 text-lg text-white/75">Please try again. If the problem continues, come back a little later.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-forest hover:bg-sage"
          >
            Try again
          </button>
          <Link href="/" className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-white/40 hover:bg-white/10">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
