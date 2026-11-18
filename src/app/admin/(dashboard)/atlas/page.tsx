import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Atlas habitats" };

export default function Page() {
  return (
    <ManagedCollection
      kind="atlas" table="ecosystems"
      title="Atlas habitats"
      description="The habitats on the Living Atlas cross-section. Species are linked to a habitat from the Species page."
      notice={<>Habitat descriptions are <strong>educational reference information</strong>. Name only well-known public places, and never describe where a sensitive species can be found.</>}
    />
  );
}
