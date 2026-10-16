import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { series } from "@/config/taxonomy";
import { allFilesWindowProps } from "@/lib/files";
import { alternates } from "@/lib/metadata";
import { getPostsBySeries, getUsedSeries, isSeriesSlug } from "@/lib/posts";

type Props = { params: Promise<{ series: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUsedSeries().map(({ slug }) => ({ series: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: slug } = await params;
  if (!isSeriesSlug(slug)) return {};
  return {
    title: `連載「${series[slug]}」の記事`,
    alternates: alternates(`/series/${slug}`),
  };
}

/** 連載の記事を第 1 回から順に並べる（ページ送りなし） */
export default async function SeriesPage({ params }: Props) {
  const { series: slug } = await params;
  if (!isSeriesSlug(slug)) notFound();
  const posts = getPostsBySeries(slug);
  if (posts.length === 0) notFound();
  return <FileWindow {...allFilesWindowProps(posts, `検索結果: 連載=${series[slug]}`)} />;
}
