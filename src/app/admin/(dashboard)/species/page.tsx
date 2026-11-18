import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Species" };

export default function Page() {
  return (
    <ManagedCollection
      kind="species" table="species"
      title="Species"
      description="Entries in the Biodiversity Explorer. Published entries get their own page."
      notice={<>Check every scientific name and conservation status against a reliable source before publishing. Choose <strong>ABC field observation</strong> only for species actually recorded by ABC participants; everything else is <strong>Educational reference</strong>. Never give precise locations for threatened species.</>}
      optionSources={[
        { field: "category_id", table: "biodiversity_categories", label: "name" },
        { field: "ecosystem_id", table: "ecosystems", label: "name" },
      ]}
    />
  );
}
