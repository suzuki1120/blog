import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/ListPage/ListPage";
import { categories } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { getPostsByCategory, getUsedCategories, isCategorySlug, paginate } from "@/lib/posts";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUsedCategories().map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategorySlug(category)) return {};
  return {
    title: `カテゴリ「${categories[category]}」の記事`,
    alternates: alternates(`/categories/${category}`),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();
  const posts = getPostsByCategory(category);
  const page = paginate(posts, 1);
  if (!page || posts.length === 0) notFound();
  return (
    <ListPage
      title={`カテゴリ: ${categories[category]}`}
      lead={`${posts.length}件の記事`}
      page={page}
      basePath={`/categories/${category}`}
    />
  );
}
