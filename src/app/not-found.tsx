import Link from "next/link";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-forest px-6 text-center text-white">
      <LogoMark className="size-14 text-sage" />
      <p className="eyebrow mt-8 text-sage">Error 404</p>
      <h1 className="mt-4 font-display text-4xl font-medium sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-white/70">The page you were looking for could not be found.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-forest hover:bg-sage">
        Return home
      </Link>
    </main>
  );
}
