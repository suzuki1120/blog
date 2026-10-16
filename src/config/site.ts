export const siteConfig = {
  name: "Blog",
  description: "Next.js と Cloudflare Workers で運用している技術ブログです。",
  author: "suzuki tatsuya",
  locale: "ja_JP",
  // 独自ドメインに移行する場合は NEXT_PUBLIC_SITE_URL で上書きする
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.kiraides.workers.dev").replace(/\/$/, ""),
  postsPerPage: 30,
  // プロフィールページ（/about）に出す内容
  profile: {
    bio: "このブログの管理人です。Next.js と Cloudflare Workers を使った Web 制作で試したことや、調べたことを記録しています。",
    // 例: { label: "GitHub", href: "https://github.com/..." }
    links: [] as { label: string; href: string }[],
  },
} as const;
