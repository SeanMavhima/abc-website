import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import type { Article, ArticleCategory } from "@/lib/types";
import { StoryEditor } from "./story-editor";

export const metadata: Metadata = { title: "Edit story" };

type Props = { params: Promise<{ id: string }> };

export default async function EditStory({ params }: Props) {
  const { id } = await params;
  const { supabase, profile } = await requireAdminPage();
  const { data: cats } = await supabase.from("article_categories").select("*").order("sort_order");
  const categories = (cats ?? []) as ArticleCategory[];

  if (id === "new") {
    return (
      <StoryEditor
        categories={categories}
        initial={{
          id: "",
          slug: "",
          title: "",
          excerpt: "",
          content: "",
          featured_image: null,
          gallery: [],
          video_url: "",
          category_id: categories[0]?.id ?? null,
          author_name: profile.full_name || "ABC",
          status: "draft",
          published_at: null,
          is_featured: false,
          seo_title: "",
          seo_description: "",
        }}
      />
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const article = data as Article;
  return <StoryEditor categories={categories} initial={{ ...article, gallery: Array.isArray(article.gallery) ? article.gallery : [] }} />;
}
