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
        <p className={styles.date}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        <h1 className={styles.title}>
          <span aria-hidden="true">▼</span>
          {post.title}
        </h1>
        <ul className={styles.meta}>
          <li>
            カテゴリ: <Link href={`/categories/${post.category}`}>{categories[post.category]}</Link>
          </li>
          {post.tags.length > 0 && (
            <li>
              タグ: <TagList tags={post.tags} />
            </li>
          )}
          {post.updated && (
            <li>
              更新: <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </li>
          )}
          <li>約{post.readingMinutes}分で読めます</li>
        </ul>
      </header>

      <MdxContent code={post.mdx} />

      <nav aria-label="前後の記事" className={styles.adjacent}>
        <ul>
          {older && (
            <li>
              <Link href={`/posts/${older.slug}`} rel="prev" title={older.title}>
                « 前の記事
              </Link>
            </li>
          )}
          <li>
            <Link href="/">HOME</Link>
          </li>
          {newer && (
            <li>
              <Link href={`/posts/${newer.slug}`} rel="next" title={newer.title}>
                次の記事 »
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </article>
  );
}
