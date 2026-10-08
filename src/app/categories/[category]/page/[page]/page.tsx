import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { categories } from "@/config/taxonomy";
import { fileWindowProps } from "@/lib/files";
import { alternates } from "@/lib/metadata";
import {
  getPageParams,
  getPostsByCategory,
  getUsedCategories,
  isCategorySlug,
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
  const page = parsePageParam(pageParam) ?? NaN;
  const props = fileWindowProps(posts, page, `/categories/${category}`, `検索結果: 種類=${categories[category]}`);
  if (!props || page === 1) notFound();
  return <FileWindow {...props} />;
}
