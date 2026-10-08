// URL にはスラッグ（ASCII）を使い、画面には表示名を出す。
// 記事の frontmatter で使えるのはここに定義したスラッグのみ（未定義だとビルドエラー）。

export const categories = {
  tech: "技術",
  dev: "開発環境",
  notes: "雑記",
} as const;

export const tags = {
  nextjs: "Next.js",
  cloudflare: "Cloudflare",
  typescript: "TypeScript",
  react: "React",
  scss: "SCSS",
  mdx: "MDX",
  git: "Git",
  tips: "Tips",
} as const;

export type CategorySlug = keyof typeof categories;
export type TagSlug = keyof typeof tags;

export const categorySlugs = Object.keys(categories) as [CategorySlug, ...CategorySlug[]];
export const tagSlugs = Object.keys(tags) as [TagSlug, ...TagSlug[]];
