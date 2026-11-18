import Image from "next/image";
import { LogoMark } from "@/components/site/logo";
import { PHOTOS } from "@/content/photos";

/** Split-screen layout used by the login and password pages. */
export function AuthShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest lg:block">
        <Image src={PHOTOS.craneWetland.src} alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="font-display text-3xl font-bold">Together for All Life.</p>
          <p className="mt-2 text-sm text-white/70">ABC content manager</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <LogoMark className="size-11 text-evergreen" />
          <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
