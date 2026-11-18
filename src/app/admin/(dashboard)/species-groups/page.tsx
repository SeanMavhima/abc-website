import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Species groups" };

export default function Page() {
  return (
    <ManagedCollection
      kind="speciesGroups" table="biodiversity_categories"
      title="Species groups"
      description="Groups such as Birds, Mammals, Insects and Plants. Visitors use them to filter the species explorer."
    />
  );
}
