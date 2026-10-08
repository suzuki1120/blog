export const siteConfig = {
  name: "Blog",
  description: "Next.js と Cloudflare Workers で運用している技術ブログです。",
  author: "suzuki tatsuya",
  locale: "ja_JP",
  // 本番ドメインが決まったら NEXT_PUBLIC_SITE_URL で上書きする
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  postsPerPage: 10,
} as const;
