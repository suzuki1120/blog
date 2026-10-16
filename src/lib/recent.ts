import { createLocalStore } from "@/lib/local-store";

export type RecentFile = { slug: string; title: string };

const MAX = 5;

/** 閲覧者が最近開いた記事（新しい順）。その人のブラウザにだけ保存する */
export const recentStore = createLocalStore<RecentFile[]>("blog:recent", [], (value) =>
  Array.isArray(value)
    ? value
        .filter((v): v is RecentFile => typeof v?.slug === "string" && typeof v?.title === "string")
        .slice(0, MAX)
    : [],
);

export function recordRecent(file: RecentFile) {
  recentStore.write([file, ...recentStore.read().filter((f) => f.slug !== file.slug)].slice(0, MAX));
}
