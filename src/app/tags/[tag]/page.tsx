import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/ListPage/ListPage";
import { tags } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { getPostsByTag, getUsedTags, isTagSlug, paginate } from "@/lib/posts";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getUsedTags().map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  if (!isTagSlug(tag)) return {};
  return {
    title: `タグ「${tags[tag]}」の記事`,
    alternates: alternates(`/tags/${tag}`),
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  if (!isTagSlug(tag)) notFound();
  const posts = getPostsByTag(tag);
  const page = paginate(posts, 1);
  if (!page || posts.length === 0) notFound();
  return (
    <ListPage title={`#${tags[tag]}`} lead={`${posts.length}件の記事`} page={page} basePath={`/tags/${tag}`} />
  );
}
