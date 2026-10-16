import { allPosts, type Post } from "content-collections";
import { siteConfig } from "@/config/site";
import {
  categories,
  categorySlugs,
  series,
  seriesSlugs,
  tags,
  type CategorySlug,
  type SeriesSlug,
  type TagSlug,
} from "@/config/taxonomy";

export type { Post };

// 下書きは開発時のみ表示する
const published = allPosts
  .filter((post) => process.env.NODE_ENV !== "production" || !post.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

// ビルド時点から 14 日以内の記事に「NEW!」を付ける
const NEW_DAYS = 14;
const builtAt = Date.now();

export function isNewPost(date: string): boolean {
  return builtAt - Date.parse(`${date}T00:00:00+09:00`) < NEW_DAYS * 24 * 60 * 60 * 1000;
}

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

/** シリーズの記事を日付の古い順（第 1 回から）に返す */
export function getPostsBySeries(slug: SeriesSlug): Post[] {
  return published.filter((post) => post.series === slug).reverse();
}

/**
 * 同じタグが多い順に関連記事を返す。同じカテゴリなら少し上げ、同点は新しい順。
 * 同じシリーズの記事はシリーズの欄に出すので除く
 */
export function getRelatedPosts(post: Post, limit = 5): Post[] {
  return published
    .filter((other) => other.slug !== post.slug && !(post.series && other.series === post.series))
    .map((other) => ({
      other,
      score:
        other.tags.filter((tag) => post.tags.includes(tag)).length * 2 + (other.category === post.category ? 1 : 0),
    }))
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ other }) => other);
}

/** 新規公開と更新を日付の新しい順に並べた更新履歴 */
export function getUpdates(limit = 5): { post: Post; date: string; kind: "新規" | "更新" }[] {
  return published
    .flatMap((post) => [
      { post, date: post.date, kind: "新規" as const },
      ...(post.updated ? [{ post, date: post.updated, kind: "更新" as const }] : []),
    ])
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}

/** "2026-10" の形の年月 */
export function toYearMonth(date: string): string {
  return date.slice(0, 7);
}

export function getPostsByMonth(yearMonth: string): Post[] {
  return published.filter((post) => toYearMonth(post.date) === yearMonth);
}

/** 記事がある年月（新しい順）と件数 */
export function getArchiveMonths(): { yearMonth: string; year: string; month: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of published) {
    const key = toYearMonth(post.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([yearMonth, count]) => {
    const [year, month] = yearMonth.split("-");
    return { yearMonth, year, month, count };
  });
}

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.hasOwn(categories, value);
}

export function isTagSlug(value: string): value is TagSlug {
  return Object.hasOwn(tags, value);
}

export function isSeriesSlug(value: string): value is SeriesSlug {
  return Object.hasOwn(series, value);
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

/** 記事が 1 件以上あるシリーズ */
export function getUsedSeries(): { slug: SeriesSlug; name: string; count: number }[] {
  return seriesSlugs
    .map((slug) => ({ slug, name: series[slug], count: getPostsBySeries(slug).length }))
    .filter((s) => s.count > 0);
}

export type Paginated<T> = {
  items: T[];
  currentPage: number;
  totalPages: number;
};

export function getTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / siteConfig.postsPerPage));
}

/** 1 ページ目の URL（例: "/", "/tags/nextjs"）。2 ページ目以降は `${basePath}/page/N` */
export function pageHref(basePath: string, page: number): string {
  const base = basePath === "/" ? "" : basePath;
  return page === 1 ? basePath : `${base}/page/${page}`;
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
