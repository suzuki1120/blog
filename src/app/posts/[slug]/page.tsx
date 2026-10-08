import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileInfo } from "@/components/FileInfo/FileInfo";
import { MdxContent } from "@/components/MdxContent/MdxContent";
import { siteConfig } from "@/config/site";
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
      <FileInfo post={post} />

      <h1 className={styles.title}>
        <span aria-hidden="true">■ </span>
        {post.title}
      </h1>
      <p className={styles.description}>{post.description}</p>

      <div className={styles.body}>
        <MdxContent code={post.mdx} />
      </div>

      <nav aria-label="前後の記事" className={styles.adjacent}>
        <ul>
          {older && (
            <li>
              <Link href={`/posts/${older.slug}`} rel="prev" title={older.title}>
                &lt;&lt; 前のファイル
              </Link>
            </li>
          )}
          <li>
            <Link href="/">ファイル一覧</Link>
          </li>
          {newer && (
            <li>
              <Link href={`/posts/${newer.slug}`} rel="next" title={newer.title}>
                次のファイル &gt;&gt;
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </article>
  );
}
