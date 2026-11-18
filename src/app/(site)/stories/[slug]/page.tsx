import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, Linkedin, Mail, Twitter } from "lucide-react";
import { getArticle, getArticleSlugs, getArticles, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { formatDate, readingTime } from "@/lib/utils";
import { parseVideoUrl } from "@/lib/video";
import { PageHero } from "@/components/site/page-hero";
import { StoryCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { RichText } from "@/components/blocks/shared";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, article] = await Promise.all([getSiteSettings(), getArticle(slug)]);
  if (!article) return { title: "Story not found" };
  return pageMetadata({
    settings,
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    image: article.featured_image,
    path: `/stories/${article.slug}`,
    type: "article",
    publishedTime: article.published_at,
  });
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const [settings, article] = await Promise.all([getSiteSettings(), getArticle(slug)]);
  if (!article || article.status !== "published" || !article.published_at || new Date(article.published_at) > new Date()) {
    notFound();
  }
  const { items: related } = await getArticles({ pageSize: 3, excludeId: article.id, category: article.category?.slug });
  const video = parseVideoUrl(article.video_url);
  const url = absoluteUrl(`/stories/${article.slug}`);
  const share = [
    { label: "Share on LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "Share on X", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}` },
    { label: "Share by email", icon: Mail, href: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(url)}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    image: article.featured_image?.src ? [absoluteUrl(article.featured_image.src)] : undefined,
    author: { "@type": "Organization", name: article.author_name || settings.org_name },
    publisher: { "@type": "Organization", name: settings.org_name },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero
        eyebrow={article.category?.name || "Story"}
        title={article.title}
        description={article.excerpt}
        image={article.featured_image}
        crumbs={[{ label: "Stories & Insights", href: "/stories" }, { label: article.title }]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
          {article.author_name ? <span>By {article.author_name}</span> : null}
          <time dateTime={article.published_at ?? undefined}>{formatDate(article.published_at)}</time>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" /> {readingTime(article.content)} min read
          </span>
        </div>
      </PageHero>

      <article className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <aside className="order-2 lg:order-1 lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-earth">Share</p>
              <ul className="mt-4 flex gap-2 lg:flex-col">
                {share.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-10 items-center justify-center rounded-full text-forest ring-1 ring-forest/15 transition hover:bg-forest hover:text-white"
                    >
                      <s.icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="order-1 lg:order-2 lg:col-span-8">
            {video ? (
              <div className="mb-12">
                {video.kind === "iframe" ? (
                  <div className="relative aspect-video overflow-hidden rounded-md bg-charcoal">
                    <iframe
                      src={video.src}
                      title={video.title}
                      className="absolute inset-0 size-full"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : video.kind === "file" ? (
                  <video src={video.src} controls preload="metadata" className="w-full rounded-md bg-charcoal" />
                ) : (
                  <a href={video.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-evergreen">
                    Watch the video <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            ) : null}
            <RichText html={article.content} className="prose-xl" />

            {article.gallery.length > 0 ? (
              <section aria-label="Photo gallery" className="mt-16">
                <h2 className="font-display text-2xl font-medium text-forest">Gallery</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {article.gallery.map((img, i) => (
                    <li key={`${img.src}-${i}`} className={i === 0 && article.gallery.length % 2 === 1 ? "sm:col-span-2" : ""}>
                      <figure>
                        <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-forest">
                          <SmartImage image={img} fill sizes="(min-width: 1024px) 50vw, 100vw" />
                        </div>
                        {img.credit ? <figcaption className="mt-2 text-xs text-charcoal/55">Photo: {img.credit}</figcaption> : null}
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-16 border-t border-forest/10 pt-8">
              <Link href="/stories" className="inline-flex items-center gap-2 text-sm font-semibold text-evergreen hover:text-forest">
                <ArrowLeft className="size-4" /> Back to all stories
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="bg-ivory py-20 sm:py-24">
          <div className="container-site">
            <h2 className="font-display text-3xl font-medium text-forest">More stories</h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {related.map((a, i) => (
                <Reveal as="li" key={a.id} delay={i * 0.08}>
                  <StoryCard article={a} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
