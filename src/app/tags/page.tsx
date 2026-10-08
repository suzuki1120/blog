import type { Metadata } from "next";
import { TagList } from "@/components/TagList/TagList";
import { alternates } from "@/lib/metadata";
import { getUsedCategories, getUsedTags } from "@/lib/posts";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "カテゴリ・タグ一覧",
  alternates: alternates("/tags"),
};

export default function TagsPage() {
  const usedTags = getUsedTags();
  const counts = Object.fromEntries(usedTags.map((t) => [t.slug, t.count]));

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>カテゴリ・タグ一覧</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>カテゴリ</h2>
        <ul className={styles.categories}>
          {getUsedCategories().map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`}>{c.name}</Link>
              <span className={styles.count}> ({c.count})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>タグ</h2>
        <TagList tags={usedTags.map((t) => t.slug)} counts={counts} variant="cloud" />
      </section>
    </div>
  );
}
