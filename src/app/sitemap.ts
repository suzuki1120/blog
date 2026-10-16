import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPosts, getArchiveMonths, getUsedCategories, getUsedSeries, getUsedTags } from "@/lib/posts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? posts[0]?.date;

  return [
    { url: `${siteConfig.url}/`, lastModified: latest },
    { url: `${siteConfig.url}/tags` },
    { url: `${siteConfig.url}/archives` },
    { url: `${siteConfig.url}/about` },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/posts/${post.slug}`,
      lastModified: post.updated ?? post.date,
    })),
    ...getUsedCategories().map((c) => ({ url: `${siteConfig.url}/categories/${c.slug}` })),
    ...getUsedTags().map((t) => ({ url: `${siteConfig.url}/tags/${t.slug}` })),
    ...getUsedSeries().map((s) => ({ url: `${siteConfig.url}/series/${s.slug}` })),
    ...getArchiveMonths().map((m) => ({ url: `${siteConfig.url}/archives/${m.year}/${m.month}` })),
  ];
}
