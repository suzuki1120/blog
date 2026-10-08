import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { tags } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { fileWindowProps } from "@/lib/files";
import { getPageParams, getPostsByTag, getUsedTags, isTagSlug, parsePageParam } from "@/lib/posts";

type Props = { params: Promise<{ tag: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUsedTags().flatMap(({ slug, count }) => getPageParams(count).map(({ page }) => ({ tag: slug, page })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, page } = await params;
  if (!isTagSlug(tag)) return {};
  return {
    title: `タグ「${tags[tag]}」の記事（${page}ページ目）`,
    alternates: alternates(`/tags/${tag}/page/${page}`),
  };
}

export default async function TagPagedPage({ params }: Props) {
  const { tag, page: pageParam } = await params;
  if (!isTagSlug(tag)) notFound();
  const posts = getPostsByTag(tag);
  const page = parsePageParam(pageParam) ?? NaN;
  const props = fileWindowProps(posts, page, `/tags/${tag}`, `検索結果: タグ=${tags[tag]}`);
  if (!props || page === 1) notFound();
  return <FileWindow {...props} />;
}
