import { allPosts, type Post } from "content-collections";
import { siteConfig } from "@/config/site";
import {
  categories,
  categorySlugs,
  tags,
  type CategorySlug,
  type TagSlug,
} from "@/config/taxonomy";

export type { Post };

// 下書きは開発時のみ表示する
const published = allPosts
  .filter((post) => process.env.NODE_ENV !== "production" || !post.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

export function getAllPosts(): Post[] {
  return published;
}

export function getPostBySlug(slug: string): Post | undefined {
  return published.find((post) => post.slug === slug);
}

/** 日付の新しい順で、前（新しい記事）と次（古い記事）を返す */
export function getAdjacentPosts(slug: string) {
  const index = published.findIndex((post) => post.slug === slug);
  return {
    newer: index > 0 ? published[index - 1] : undefined,
    older: index >= 0 && index < published.length - 1 ? published[index + 1] : undefined,
  };
}

export function getPostsByCategory(category: CategorySlug): Post[] {
  return published.filter((post) => post.category === category);
}

export function getPostsByTag(tag: TagSlug): Post[] {
  return published.filter((post) => post.tags.includes(tag));
}

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.hasOwn(categories, value);
}

export function isTagSlug(value: string): value is TagSlug {
  return Object.hasOwn(tags, value);
}

/** 記事が 1 件以上あるカテゴリ */
export function getUsedCategories(): { slug: CategorySlug; name: string; count: number }[] {
  return categorySlugs
    .map((slug) => ({ slug, name: categories[slug], count: getPostsByCategory(slug).length }))
    .filter((c) => c.count > 0);
}

/** 記事が 1 件以上あるタグ（件数の多い順） */
export function getUsedTags(): { slug: TagSlug; name: string; count: number }[] {
  const counts = new Map<TagSlug, number>();
  for (const post of published) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, name: tags[slug], count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  totalPages: number;
};

export function getTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / siteConfig.postsPerPage));
}

/** ページ番号は 1 始まり。範囲外なら undefined */
export function paginate<T>(items: T[], page: number): Paginated<T> | undefined {
  const totalPages = getTotalPages(items.length);
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return undefined;
  const start = (page - 1) * siteConfig.postsPerPage;
  return {
    items: items.slice(start, start + siteConfig.postsPerPage),
    currentPage: page,
    totalPages,
  };
}

/** 2 ページ目以降の generateStaticParams 用 */
export function getPageParams(count: number): { page: string }[] {
  const totalPages = getTotalPages(count);
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

/** "/page/2" の [page] を数値に変換。"2" 以外の表記（"02" など）は無効 */
export function parsePageParam(value: string): number | undefined {
  return /^[1-9]\d*$/.test(value) ? Number(value) : undefined;
}
