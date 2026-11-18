import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | ABC Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-scope min-h-screen bg-[#f6f7f4] text-charcoal">{children}</div>;
}
