# Blog

Next.js（App Router）で作成し、Cloudflare Workers（[OpenNext](https://opennext.js.org/cloudflare)）で配信するブログです。

- 記事: `content/posts/*.mdx`（[content-collections](https://www.content-collections.dev/) でビルド時に型付きデータへ変換）
- スタイル: CSS Modules + SCSS（`src/styles/` に変数と mixin）
- コードのハイライト: rehype-pretty-code（Shiki）をビルド時に適用
- 全ページをビルド時に静的生成（SSG）。Worker は生成済みの HTML を返すだけ

## 仕組み

Markdown（MDX）で書いた記事を、ビルド時に全ページ分の HTML へ変換し、Cloudflare に置いて配信します。
閲覧のたびにサーバーでページを組み立てることはしていません。

```
① 記事を書く             content/posts/*.mdx
        ↓
② ビルド（npm run build）
   ├ ロゴ生成    scripts/generate-logo.mjs がサイト名から ASCII アートを作る
   ├ 記事の変換  content-collections.ts が .mdx を読み、データに変換する
   └ ページ生成  Next.js が src/app/ の各ページに記事データを流し込み、HTML を作る
        ↓
③ 配信（npm run deploy、または main への push で自動実行）
        ↓
④ 閲覧者のアクセスには、作っておいた HTML をそのまま返す
```

### フォルダの役割

| 場所 | 中身 |
| --- | --- |
| `content/posts/` | 記事本体。普段の更新はほぼここだけ |
| `src/config/site.ts` | サイト名・著者名・プロフィールなどの設定 |
| `src/config/taxonomy.ts` | カテゴリ・タグ・連載の一覧 |
| `src/app/` | 各ページ。フォルダ構成がそのまま URL になる |
| `src/components/` | ヘッダー・目次・共有ボタンなど、ページを組み立てる部品 |
| `src/lib/posts.ts` | 記事の絞り込み（タグ別・カテゴリ別など）、前後の記事・関連記事の検索 |
| `src/styles/` | 色や余白など、デザインの共通設定（SCSS の変数と mixin） |
| `scripts/` | ビルド前に実行するスクリプト（ロゴ生成） |

### ページと URL の対応

`[slug]` のような角括弧付きのフォルダには、記事ごとに異なる値が入ります。

| ファイル | URL |
| --- | --- |
| `src/app/page.tsx` | `/`（トップ） |
| `src/app/posts/[slug]/page.tsx` | `/posts/<記事のファイル名>` |
| `src/app/categories/[category]/page.tsx` | `/categories/<カテゴリ>` |
| `src/app/tags/[tag]/page.tsx` | `/tags/<タグ>` |
| `src/app/series/[series]/page.tsx` | `/series/<連載>` |
| `src/app/archives/[year]/[month]/page.tsx` | `/archives/<年>/<月>` |
| `src/app/about/page.tsx` | `/about`（プロフィール） |
| `src/app/feed.xml/route.ts` | `/feed.xml`（RSS） |
| `src/app/sitemap.ts` / `src/app/robots.ts` | 検索エンジン向けの sitemap.xml / robots.txt |

### 記事 1 本がページになるまで

1. **先頭の設定（frontmatter）を確認する**（`content-collections.ts` の `schema`）
   zod で項目の形式を確認します。日付の形式違いや、`taxonomy.ts` にないタグ・カテゴリはここでビルドエラーになります。
2. **本文を変換する**（`content-collections.ts` の `transform`）
   MDX の変換、コードの色付け（rehype-pretty-code）、目次用の見出しの抽出、読了時間（1 分 500 文字で計算）の算出を行います。
3. **作るページの一覧を決める**（`src/app/posts/[slug]/page.tsx` の `generateStaticParams`）
   全記事分のページを生成します。`dynamicParams = false` により、一覧にない URL は 404 になります。
4. **ページを組み立てる**（同じファイルの `PostPage`）
   アドレスバー・目次・本文・連載・共有ボタン・関連記事・前後の記事へのリンクを並べます。
5. **共通の枠に入れる**（`src/app/layout.tsx`）
   全ページ共通のヘッダー・メニュー・フッターで囲みます。

`draft: true` の記事は `npm run dev` では表示され、本番のビルドでは除かれます（`src/lib/posts.ts`）。

### コードを読む順番

1. `content/posts/hello-world.mdx`：記事の書き方
2. `content-collections.ts`：記事の変換方法
3. `src/lib/posts.ts`：変換したデータの絞り込みと並べ替え
4. `src/app/posts/[slug]/page.tsx`：データからページを作る方法
5. `src/app/layout.tsx`：全ページ共通の枠

## 開発

```bash
npm install
npm run dev        # http://localhost:3000（下書き記事も表示）
npm run preview    # Workers ランタイムで本番相当の確認（http://localhost:8787）
npm run lint
```

## 記事の追加

`content/posts/<slug>.mdx` を作成します。ファイル名が URL（`/posts/<slug>`）になります。

```md
---
title: 記事タイトル
description: 一覧や SNS 共有時に表示される説明文
date: 2026-10-08
updated: 2026-10-10      # 任意
category: tech           # src/config/taxonomy.ts の categories のキー
tags: [nextjs, tips]     # src/config/taxonomy.ts の tags のキー
series: blog-build       # 任意。src/config/taxonomy.ts の series のキー（連載は日付の古い順に並ぶ）
draft: true              # 任意。true の間は本番に出ない
ogImage: /images/xx.png  # 任意。未指定ならタイトル入りの画像を自動生成
---
```

カテゴリ・タグ・連載を増やすときは `src/config/taxonomy.ts` に「スラッグ: 表示名」を追加します。未定義の値を書くとビルドエラーになります。

目次は記事の h2・h3（`##`・`###`）から自動で作ります。見出しが 2 つ以上ある記事にだけ表示されます。

## 設定

| 項目 | 場所 |
| --- | --- |
| サイト名・説明・著者・1 ページの件数 | `src/config/site.ts` |
| プロフィールページ（`/about`）の自己紹介・リンク | `src/config/site.ts` の `profile` |
| 本番 URL（canonical / OGP / RSS / sitemap に使用） | `src/config/site.ts` の既定値（`https://blog.kiraides.workers.dev`）。環境変数 `NEXT_PUBLIC_SITE_URL` で上書きできます |
| Worker 名・互換性設定 | `wrangler.jsonc` |

## デプロイ

```bash
npx wrangler login                                          # 初回のみ
npm run deploy
```

### Cloudflare Workers Builds（Git 連携による自動デプロイ）

`main` への push で自動的にビルド・デプロイされます。Workers Builds の npm は 10.9.2 固定で変更できないため、
自動インストールを止め、ビルドコマンド内で npm 11 を使ってインストールしています。

| 設定項目（Settings > Build） | 値 |
| --- | --- |
| ビルドコマンド | `npm run cf:build` |
| デプロイコマンド | `npx opennextjs-cloudflare deploy` |
| ビルド変数 `SKIP_DEPENDENCY_INSTALL` | `true` |
| ビルド変数 `NEXT_PUBLIC_SITE_URL` | 独自ドメインに移行する場合のみ設定 |

push してもデプロイ一覧にビルドが出ない場合は、次を確認してください。

- 本番ブランチが `main` になっているか、ビルド監視パスで対象外にしていないか（Settings > Build）
- GitHub の「Cloudflare Workers and Pages」アプリに、このリポジトリへのアクセスを許可しているか

## 注意点

- Next.js は `16.3.8` に固定しています。16.4.0 は `@opennextjs/cloudflare@1.20.9` と組み合わせると、
  事前生成されていない URL（404 など）へのアクセスで Worker が 500 エラーになります
  （`preview-props.json` が Worker に取り込まれないため）。OpenNext 側の対応後に更新してください。
- Cache Components（`cacheComponents`）は無効です。`dynamicParams = false` で未知の URL を 404 にしているため。
- 記事本文の描画は実行時に `new Function` を使うため Workers 上では実行できません。
  記事ページは必ず静的生成のままにしてください（`generateStaticParams` + `dynamicParams = false`）。
- 画像最適化は無効（`images.unoptimized`）です。必要になったら Cloudflare Images のバインディングを設定します。
