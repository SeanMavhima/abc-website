import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNatureLabs, getProject, getProjects, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { ProjectView } from "@/components/site/project-view";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects("citizen_science")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, project] = await Promise.all([getSiteSettings(), getProject("citizen_science", slug)]);
  if (!project) return { title: "Project not found" };
  return pageMetadata({ settings, title: project.title, description: project.summary, image: project.cover_image, path: `/citizen-science/${project.slug}` });
}

export default async function CitizenScienceProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, labs] = await Promise.all([getProject("citizen_science", slug), getNatureLabs()]);
  if (!project) notFound();
  return <ProjectView project={project} lab={labs.find((l) => l.id === project.lab_id) ?? null} back={{ href: "/citizen-science#projects", label: "Citizen Science" }} />;
}
