"use client";

import { useEffect } from "react";
import { recordRecent } from "@/lib/recent";

/** 記事ページに置き、開いた記事を「最近使ったファイル」に記録する。画面には何も出さない */
export function RecordVisit({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    recordRecent({ slug, title });
  }, [slug, title]);
  return null;
}
