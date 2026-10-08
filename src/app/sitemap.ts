import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPosts, getUsedCategories, getUsedTags } from "@/lib/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? posts[0]?.date;

  return [
    { url: `${siteConfig.url}/`, lastModified: latest },
    { url: `${siteConfig.url}/tags` },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/posts/${post.slug}`,
      lastModified: post.updated ?? post.date,
    })),
    ...getUsedCategories().map((c) => ({ url: `${siteConfig.url}/categories/${c.slug}` })),
    ...getUsedTags().map((t) => ({ url: `${siteConfig.url}/tags/${t.slug}` })),
  ];
}
