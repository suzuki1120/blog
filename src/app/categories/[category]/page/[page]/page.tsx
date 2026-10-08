import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/ListPage/ListPage";
import { categories } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import {
  getPageParams,
  getPostsByCategory,
  getUsedCategories,
  isCategorySlug,
  paginate,
  parsePageParam,
} from "@/lib/posts";

type Props = { params: Promise<{ category: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUsedCategories().flatMap(({ slug, count }) =>
    getPageParams(count).map(({ page }) => ({ category: slug, page })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  if (!isCategorySlug(category)) return {};
  return {
    title: `カテゴリ「${categories[category]}」の記事（${page}ページ目）`,
    alternates: alternates(`/categories/${category}/page/${page}`),
  };
}

export default async function CategoryPagedPage({ params }: Props) {
  const { category, page: pageParam } = await params;
  if (!isCategorySlug(category)) notFound();
  const posts = getPostsByCategory(category);
  const page = paginate(posts, parsePageParam(pageParam) ?? NaN);
  if (!page || page.currentPage === 1) notFound();
  return (
    <ListPage
      title={`カテゴリ: ${categories[category]}`}
      lead={`${posts.length}件の記事（${page.currentPage} / ${page.totalPages} ページ）`}
      page={page}
      basePath={`/categories/${category}`}
    />
  );
}
