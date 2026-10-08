import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/MdxContent/MdxContent";
import { TagList } from "@/components/TagList/TagList";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/taxonomy";
import { formatDate } from "@/lib/format";
import { alternates } from "@/lib/metadata";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import styles from "./page.module.scss";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) return {};
  const path = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: alternates(path),
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [siteConfig.author],
      tags: [...post.tags],
      // ogImage 指定がなければ opengraph-image.tsx の生成画像が使われる
      ...(post.ogImage && { images: [post.ogImage] }),
    },
    ...(post.draft && { robots: { index: false } }),
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const { newer, older } = getAdjacentPosts(post.slug);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated && (
            <span>
              更新 <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </span>
          )}
          <Link href={`/categories/${post.category}`}>{categories[post.category]}</Link>
          <span>約{post.readingMinutes}分で読めます</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <TagList tags={post.tags} />
      </header>

      <MdxContent code={post.mdx} />

      <nav aria-label="前後の記事" className={styles.adjacent}>
        {older ? (
          <Link href={`/posts/${older.slug}`} className={styles.adjacentLink}>
            <span className={styles.adjacentLabel}>← 前の記事</span>
            {older.title}
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/posts/${newer.slug}`} className={`${styles.adjacentLink} ${styles.next}`}>
            <span className={styles.adjacentLabel}>次の記事 →</span>
            {newer.title}
          </Link>
        )}
      </nav>
    </article>
  );
}
