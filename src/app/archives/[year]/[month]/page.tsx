import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { allFilesWindowProps } from "@/lib/files";
import { alternates } from "@/lib/metadata";
import { getArchiveMonths, getPostsByMonth } from "@/lib/posts";

type Props = { params: Promise<{ year: string; month: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getArchiveMonths().map(({ year, month }) => ({ year, month }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  return {
    title: `${year} 年 ${Number(month)} 月の記事`,
    alternates: alternates(`/archives/${year}/${month}`),
  };
}

/** 月別の記事一覧（ページ送りなし） */
export default async function MonthArchivePage({ params }: Props) {
  const { year, month } = await params;
  const posts = getPostsByMonth(`${year}-${month}`);
  if (posts.length === 0) notFound();
  return <FileWindow {...allFilesWindowProps(posts, `検索結果: 日付=${year}/${month}`)} />;
}
