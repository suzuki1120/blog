import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * ページの alternates は layout の値を丸ごと上書きするため、
 * canonical と RSS の link をまとめて返す
 */
export function alternates(path?: string): Metadata["alternates"] {
  return {
    ...(path && { canonical: path }),
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} RSS` }],
    },
  };
}
