import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNatureLabs, getProject, getProjects, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { ProjectView } from "@/components/site/project-view";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects("research")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, project] = await Promise.all([getSiteSettings(), getProject("research", slug)]);
  if (!project) return { title: "Project not found" };
  return pageMetadata({ settings, title: project.title, description: project.summary, image: project.cover_image, path: `/research/${project.slug}` });
}

export default async function ResearchProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, labs] = await Promise.all([getProject("research", slug), getNatureLabs()]);
  if (!project) notFound();
  return <ProjectView project={project} lab={labs.find((l) => l.id === project.lab_id) ?? null} back={{ href: "/research#projects", label: "Research & Insights" }} />;
}
