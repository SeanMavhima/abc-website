import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Milestones" };

export default function Page() {
  return (
    <ManagedCollection
      kind="milestones" table="milestones"
      title="Milestones"
      description="The timeline shown in Milestones sections. Use the arrows to put stages in order."
      notice={<>Mark a milestone <strong>In progress</strong> or <strong>Done</strong> only when that is true. Planned stages should stay <strong>Planned</strong>.</>}
    />
  );
}
