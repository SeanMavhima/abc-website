import type { Metadata } from "next";
import { ManagedCollection } from "@/components/admin/managed-collection";

export const metadata: Metadata = { title: "Nature Labs" };

export default function Page() {
  return (
    <ManagedCollection
      kind="natureLabs" table="nature_labs"
      title="Nature Labs"
      description="Community Nature Learning and Citizen Science Labs, shown in Nature Lab sites sections."
      notice={<>Add a Nature Lab only once a site has been <strong>agreed with the community</strong>, and keep its status accurate. Name a host school or institution only with their permission, and keep the region general.</>}
    />
  );
}
