import { categories } from "@/config/taxonomy";
import { ogSize, renderOgImage } from "@/lib/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export const alt = "記事のアイキャッチ画像";
export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPostBySlug((await params).slug)!;
  return renderOgImage({ title: post.title, subtitle: categories[post.category] });
}
