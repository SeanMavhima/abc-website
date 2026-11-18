import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";

export default function SiteNotFound() {
  return (
    <PageHero
      eyebrow="Error 404"
      title="This trail does not lead anywhere"
      description="The page you were looking for could not be found. It may have moved, or it may not be published yet."
      size="compact"
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-forest hover:bg-sage">
          Return home <ArrowRight className="size-4" />
        </Link>
        <Link href="/stories" className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-white/40 hover:bg-white/10">
          Read our stories
        </Link>
      </div>
    </PageHero>
  );
}
