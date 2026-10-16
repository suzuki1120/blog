import type { Metadata } from "next";
import { FolderWindow } from "@/components/FolderWindow/FolderWindow";
import { alternates } from "@/lib/metadata";
import { getUsedCategories, getUsedSeries, getUsedTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "フォルダ一覧（種類・連載・タグ）",
  alternates: alternates("/tags"),
};

export default function TagsPage() {
  return (
    <FolderWindow
      title="C:\blog のフォルダ一覧"
      sections={[
        {
          heading: "種類",
          folders: getUsedCategories().map((c) => ({ href: `/categories/${c.slug}`, name: c.name, count: c.count })),
        },
        {
          heading: "連載",
          folders: getUsedSeries().map((s) => ({ href: `/series/${s.slug}`, name: s.name, count: s.count })),
        },
        {
          heading: "タグ",
          folders: getUsedTags().map((t) => ({ href: `/tags/${t.slug}`, name: t.name, count: t.count })),
        },
      ].filter((section) => section.folders.length > 0)}
    />
  );
}
