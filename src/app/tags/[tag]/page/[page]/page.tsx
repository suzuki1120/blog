import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/ListPage/ListPage";
import { tags } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { getPageParams, getPostsByTag, getUsedTags, isTagSlug, paginate, parsePageParam } from "@/lib/posts";

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
  const page = paginate(posts, parsePageParam(pageParam) ?? NaN);
  if (!page || page.currentPage === 1) notFound();
  return (
    <ListPage
      title={`#${tags[tag]}`}
      lead={`${posts.length}件の記事（${page.currentPage} / ${page.totalPages} ページ）`}
      page={page}
      basePath={`/tags/${tag}`}
    />
  );
}
