import type { Metadata } from "next";
import { FolderWindow } from "@/components/FolderWindow/FolderWindow";
import { siteConfig } from "@/config/site";
import { alternates } from "@/lib/metadata";
import { getArchiveMonths } from "@/lib/posts";

export const metadata: Metadata = {
  title: "過去ログ（月別の記事）",
  alternates: alternates("/archives"),
};

/** 年ごとに、月のフォルダを並べる */
export default function ArchivesPage() {
  const years = new Map<string, ReturnType<typeof getArchiveMonths>>();
  for (const month of getArchiveMonths()) {
    years.set(month.year, [...(years.get(month.year) ?? []), month]);
  }
  return (
    <FolderWindow
      title={`C:\\${siteConfig.name}\\過去ログ`}
      sections={[...years.entries()].map(([year, months]) => ({
        heading: `${year} 年`,
        folders: months.map((m) => ({ href: `/archives/${m.year}/${m.month}`, name: `${Number(m.month)} 月`, count: m.count })),
      }))}
    />
  );
}
