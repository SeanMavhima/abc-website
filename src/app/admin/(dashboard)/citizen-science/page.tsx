import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Citizen science" };

export default function Page() {
  return (
    <ManagedCollection
      kind="citizenScience" table="citizen_science_projects"
      title="Citizen science"
      description="Recording activities that communities can take part in. Published projects get their own page."
      notice={<>Keep each status honest: <strong>Proposed</strong> and <strong>Planned</strong> mean nothing has started. Leave <strong>Findings</strong> empty until there are real, checked results.</>}
      optionSources={[{ field: "lab_id", table: "nature_labs", label: "name" }]}
    />
  );
}
