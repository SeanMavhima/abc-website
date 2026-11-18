import type { Metadata } from "next";
import { NotebookView } from "@/components/nature/notebook-view";

export const metadata: Metadata = {
  title: "My field notebook",
  description: "Species you have saved from the Biodiversity Explorer, with your own notes. Stored only on your device.",
  robots: { index: false },
};

export default function NotebookPage() {
  return <NotebookView />;
}
