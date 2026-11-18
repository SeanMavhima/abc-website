import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Research projects" };

export default function Page() {
  return (
    <ManagedCollection
      kind="research" table="research_projects"
      title="Research projects"
      description="Community research projects, with their question, method, status and findings."
      notice={<>Add a project once its question has been agreed with the community. Never publish findings that have not been checked, and never present planned work as completed.</>}
      optionSources={[{ field: "lab_id", table: "nature_labs", label: "name" }]}
    />
  );
}
