import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddressBar, type Crumb } from "@/components/AddressBar/AddressBar";
import { FileInfo } from "@/components/FileInfo/FileInfo";
import { RelatedFiles } from "@/components/FileWindow/RelatedFiles";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { MdxContent } from "@/components/MdxContent/MdxContent";
import { ReadingProgress } from "@/components/ReadingProgress/ReadingProgress";
import { RecordVisit } from "@/components/Menu/RecordVisit";
import { SeriesWindow } from "@/components/SeriesWindow/SeriesWindow";
import { ShareBox } from "@/components/ShareBox/ShareBox";
import { TocTree } from "@/components/TocTree/TocTree";
import { siteConfig } from "@/config/site";
import { categories, series, tags } from "@/config/taxonomy";
import { toFileRow } from "@/lib/files";
import { alternates } from "@/lib/metadata";
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getPostsBySeries,
  getRelatedPosts,
  type Post,
} from "@/lib/posts";
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

// 日付だけだとタイムゾーンが決まらないため、日本時間の 0 時として出す
const toDateTime = (date: string) => `${date}T00:00:00+09:00`;

/** 記事（BlogPosting）とパンくず（BreadcrumbList）の構造化データ */
function postJsonLd(post: Post, crumbs: Crumb[]) {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        url,
        mainEntityOfPage: url,
        datePublished: toDateTime(post.date),
        dateModified: toDateTime(post.updated ?? post.date),
        author: { "@type": "Person", name: siteConfig.author, url: `${siteConfig.url}/about` },
        inLanguage: "ja",
        articleSection: categories[post.category],
        keywords: post.tags.map((tag) => tags[tag]),
        ...(post.ogImage && { image: new URL(post.ogImage, siteConfig.url).href }),
        ...(post.series && {
          isPartOf: { "@type": "CreativeWorkSeries", name: series[post.series], url: `${siteConfig.url}/series/${post.series}` },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: `${siteConfig.url}${crumb.href}`,
        })),
      },
    ],
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  const { newer, older } = getAdjacentPosts(post.slug);
  const seriesPosts = post.series ? getPostsBySeries(post.series) : [];
  const crumbs: Crumb[] = [
    { name: siteConfig.name, href: "/" },
    { name: categories[post.category], href: `/categories/${post.category}` },
    { name: post.title, href: `/posts/${post.slug}` },
  ];
  // アドレスバーではサイトをドライブ、記事をファイルとして表示する
  const address: Crumb[] = [
    { ...crumbs[0], name: `C:\\${siteConfig.name}` },
    crumbs[1],
    { ...crumbs[2], name: `${post.title}.mdx` },
  ];

  return (
    <article className={styles.article}>
      <JsonLd data={postJsonLd(post, crumbs)} />
      <RecordVisit slug={post.slug} title={post.title} />
      <AddressBar items={address} />
      <FileInfo post={post} />

      <h1 className={styles.title}>
        <span aria-hidden="true">■ </span>
        {post.title}
      </h1>
      <p className={styles.description}>{post.description}</p>

      <TocTree headings={post.headings} rootName={`${post.title}.mdx`} />

      <div id="post-body" className={styles.body}>
        <MdxContent code={post.mdx} />
      </div>
      <ReadingProgress name={`${post.title}.mdx`} minutes={post.readingMinutes} targetId="post-body" />

      {post.series && (
        <SeriesWindow
          name={series[post.series]}
          href={`/series/${post.series}`}
          posts={seriesPosts}
          currentSlug={post.slug}
        />
      )}
      <ShareBox title={post.title} url={`${siteConfig.url}/posts/${post.slug}`} />
      <RelatedFiles rows={getRelatedPosts(post).map(toFileRow)} />

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
