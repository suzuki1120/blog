import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { categorySlugs, tagSlugs } from "./src/config/taxonomy";

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
            theme: { light: "github-light", dark: "github-dark-dimmed" },
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
      readingMinutes: Math.max(1, Math.round(charCount / 500)),
    };
  },
});

export default defineConfig({
  content: [posts],
});
