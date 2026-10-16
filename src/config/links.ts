// リンク集（/links）に載せるサイト。banner には 88×31 のバナー画像の URL を書く（省略すると文字のバナーになる）
export const links: { name: string; url: string; description: string; banner?: string }[] = [
  {
    name: "Next.js",
    url: "https://nextjs.org/",
    description: "このブログを作っているフレームワーク",
  },
  {
    name: "Cloudflare Workers",
    url: "https://developers.cloudflare.com/workers/",
    description: "このブログを配信している実行環境",
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/ja/",
    description: "HTML・CSS・JavaScript の調べもの",
  },
];
