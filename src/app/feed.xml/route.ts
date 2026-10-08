import { Feed } from "feed";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/taxonomy";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: `${siteConfig.url}/`,
    link: `${siteConfig.url}/`,
    language: "ja",
    copyright: `© ${siteConfig.author}`,
    feedLinks: { rss: `${siteConfig.url}/feed.xml` },
    author: { name: siteConfig.author },
  });

  for (const post of getAllPosts().slice(0, 20)) {
    const url = `${siteConfig.url}/posts/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(`${post.date}T00:00:00+09:00`),
      category: [{ name: categories[post.category] }],
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
