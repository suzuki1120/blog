import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { tags } from "@/config/taxonomy";
import { alternates } from "@/lib/metadata";
import { fileWindowProps } from "@/lib/files";
import { getPostsByTag, getUsedTags, isTagSlug } from "@/lib/posts";

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
  const props = fileWindowProps(posts, 1, `/tags/${tag}`, `検索結果: タグ=${tags[tag]}`);
  if (!props || posts.length === 0) notFound();
  return <FileWindow {...props} />;
}
