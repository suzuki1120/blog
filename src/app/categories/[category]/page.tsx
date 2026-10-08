import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { categories } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { fileWindowProps } from "@/lib/files";
import { getPostsByCategory, getUsedCategories, isCategorySlug } from "@/lib/posts";

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
  const props = fileWindowProps(posts, 1, `/categories/${category}`, `検索結果: 種類=${categories[category]}`);
  if (!props || posts.length === 0) notFound();
  return <FileWindow {...props} />;
}
