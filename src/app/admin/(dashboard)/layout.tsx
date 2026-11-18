import { requireAdminPage } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, user } = await requireAdminPage();
  const [contact, volunteer, observations] = await Promise.all([
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "new"),
    // Returns an error (and so a count of 0) until migration 5 has been run.
    supabase.from("observations").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="min-h-screen">
      <AdminSidebar
        userLabel={profile.full_name || user.email || "Administrator"}
        counts={{ contact: contact.count ?? 0, volunteer: volunteer.count ?? 0, observations: observations.count ?? 0 }}
      />
      <div className="lg:pl-64">
        <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
