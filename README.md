# Blog

Next.js（App Router）で作成し、Cloudflare Workers（[OpenNext](https://opennext.js.org/cloudflare)）で配信するブログです。

- 記事: `content/posts/*.mdx`（[content-collections](https://www.content-collections.dev/) でビルド時に型付きデータへ変換）
- スタイル: CSS Modules + SCSS（`src/styles/` に変数と mixin）
- コードのハイライト: rehype-pretty-code（Shiki）をビルド時に適用
- 全ページをビルド時に静的生成（SSG）。Worker は生成済みの HTML を返すだけ

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
draft: true              # 任意。true の間は本番に出ない
ogImage: /images/xx.png  # 任意。未指定ならタイトル入りの画像を自動生成
---
```

カテゴリ・タグを増やすときは `src/config/taxonomy.ts` に「スラッグ: 表示名」を追加します。未定義の値を書くとビルドエラーになります。

## 設定

| 項目 | 場所 |
| --- | --- |
| サイト名・説明・著者・1 ページの件数 | `src/config/site.ts` |
| 本番 URL（canonical / OGP / RSS / sitemap に使用） | 環境変数 `NEXT_PUBLIC_SITE_URL`（ビルド時に必要） |
| Worker 名・互換性設定 | `wrangler.jsonc` |

## デプロイ

```bash
npx wrangler login                                          # 初回のみ
NEXT_PUBLIC_SITE_URL=https://example.com npm run deploy
```

### Cloudflare Workers Builds（Git 連携による自動デプロイ）

`main` への push で自動的にビルド・デプロイされます。Workers Builds の npm は 10.9.2 固定で変更できないため、
自動インストールを止め、ビルドコマンド内で npm 11 を使ってインストールしています。

| 設定項目（Settings > Build） | 値 |
| --- | --- |
| ビルドコマンド | `npm run cf:build` |
| デプロイコマンド | `npx opennextjs-cloudflare deploy` |
| ビルド変数 `SKIP_DEPENDENCY_INSTALL` | `true` |
| ビルド変数 `NEXT_PUBLIC_SITE_URL` | 本番 URL |

## 注意点

- Next.js は `16.3.8` に固定しています。16.4.0 は `@opennextjs/cloudflare@1.20.9` と組み合わせると、
  事前生成されていない URL（404 など）へのアクセスで Worker が 500 エラーになります
  （`preview-props.json` が Worker に取り込まれないため）。OpenNext 側の対応後に更新してください。
- Cache Components（`cacheComponents`）は無効です。`dynamicParams = false` で未知の URL を 404 にしているため。
- 記事本文の描画は実行時に `new Function` を使うため Workers 上では実行できません。
  記事ページは必ず静的生成のままにしてください（`generateStaticParams` + `dynamicParams = false`）。
- 画像最適化は無効（`images.unoptimized`）です。必要になったら Cloudflare Images のバインディングを設定します。
