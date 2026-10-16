import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { z } from "zod";
import { categorySlugs, seriesSlugs, tagSlugs } from "./src/config/taxonomy";

export type Heading = { depth: 2 | 3; text: string; id: string };

/**
 * 目次用に h2・h3 を取り出す。id は rehype-slug と同じ github-slugger で、全見出しを文書順に通して作る
 * （同じ見出しが続くと -1, -2 が付くため、h4 なども数える必要がある）。
 * compileMDX の結果はキャッシュされ rehype プラグインが毎回動くとは限らないので、別に解析する
 */
function extractHeadings(content: string): Heading[] {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(content);
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  visit(tree, "heading", (node) => {
    const text = toString(node);
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) headings.push({ depth: node.depth, text, id });
  });
  return headings;
}

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で指定してください");

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: dateString,
    updated: dateString.optional(),
    category: z.enum(categorySlugs),
    tags: z.array(z.enum(tagSlugs)).default([]),
    series: z.enum(seriesSlugs).optional(),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    // シンタックスハイライトはここ（ビルド時）で処理し、Worker には含めない
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            // 黒地のデザインに合わせ、暗いテーマだけを使う
            theme: "github-dark-dimmed",
            keepBackground: false,
            defaultLang: "plaintext",
          },
        ],
      ],
    });

    // 日本語はおおよそ 1 分 500 文字として読了目安を出す
    const charCount = document.content.replace(/```[\s\S]*?```/g, "").replace(/\s/g, "").length;

    return {
      ...document,
      slug: document._meta.path,
      mdx,
      headings: await context.cache(document.content, extractHeadings, { key: "__headings" }),
      readingMinutes: Math.max(1, Math.round(charCount / 500)),
      // 本文（frontmatter を除く）の UTF-8 バイト数。ファイル一覧のサイズ列に使う
      byteSize: new TextEncoder().encode(document.content).length,
    };
  },
});

export default defineConfig({
  content: [posts],
});
