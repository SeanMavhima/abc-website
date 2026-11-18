import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Observations" };

export default function Page() {
  return (
    <ManagedCollection
      kind="observations" table="observations" order="created_at" ascending={false}
      title="Observations"
      description="Observations sent in by the public. Nothing appears on the website until you approve it."
      notice={<>Before approving: check the identification, remove anything that pinpoints a sensitive species or someone&apos;s home, and confirm that consent was given. Contact details are never published, and the names of people under 18 are never shown. Submissions are opened and closed in <strong>Website settings</strong>.</>}
    />
  );
}
