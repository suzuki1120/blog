import { siteConfig } from "@/config/site";
import { categories, tags } from "@/config/taxonomy";
import type { FileRow, SearchRow } from "@/lib/file-row";
import { isNewPost, pageHref, paginate, type Post } from "@/lib/posts";

export { formatSlashDate } from "@/lib/file-row";

/** Winny 風のファイル名：「[カテゴリ] タイトル.mdx」 */
export function fileName(post: Post): string {
  return `[${categories[post.category]}] ${post.title}.mdx`;
}

/** slug から作る 8 桁の識別子（FNV-1a 32bit）。ビルドごとに変わらない */
export function fileHash(slug: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

export function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function toFileRow(post: Post): FileRow {
  return {
    slug: post.slug,
    name: fileName(post),
    size: formatSize(post.byteSize),
    hash: fileHash(post.slug),
    date: post.date,
    isNew: isNewPost(post.date),
    draft: post.draft,
  };
}

export function toSearchRow(post: Post): SearchRow {
  return {
    ...toFileRow(post),
    keywords: [post.title, post.description, categories[post.category], ...post.tags.map((t) => tags[t])].join(" "),
  };
}

/** 一覧の合計サイズ */
export function totalSize(posts: Post[]): string {
  return formatSize(posts.reduce((sum, post) => sum + post.byteSize, 0));
}

/**
 * 一覧ページ（トップ・カテゴリ・タグ）の FileWindow に渡す値を作る。
 * ページ番号が範囲外なら undefined（呼び出し側で notFound にする）
 */
export function fileWindowProps(posts: Post[], page: number, basePath: string, label = "検索結果") {
  const paged = paginate(posts, page);
  if (!paged) return undefined;
  const { currentPage, totalPages } = paged;
  return {
    title: `${label} - ${posts.length} 件`,
    rows: paged.items.map(toFileRow),
    total: posts.length,
    totalSize: totalSize(posts),
    pager: {
      currentPage,
      totalPages,
      perPage: siteConfig.postsPerPage,
      prevHref: currentPage > 1 ? pageHref(basePath, currentPage - 1) : undefined,
      nextHref: currentPage < totalPages ? pageHref(basePath, currentPage + 1) : undefined,
    },
  };
}
