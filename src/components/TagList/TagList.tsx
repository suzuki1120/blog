import Link from "next/link";
import { tags as tagNames, type TagSlug } from "@/config/taxonomy";
import styles from "./TagList.module.scss";

type Props = {
  tags: readonly TagSlug[];
  counts?: Partial<Record<TagSlug, number>>;
  /** inline: カンマ区切りの文字リンク / cloud: 件数に応じて文字サイズを変えるタグクラウド */
  variant?: "inline" | "cloud";
};

/** 件数を 1〜4 の段階に振り分ける */
function cloudLevel(count: number, max: number): number {
  if (max <= 1) return 2;
  return 1 + Math.round(((count - 1) / (max - 1)) * 3);
}

export function TagList({ tags, counts, variant = "inline" }: Props) {
  if (tags.length === 0) return null;
  const max = Math.max(...tags.map((tag) => counts?.[tag] ?? 1));

  return (
    <ul className={variant === "cloud" ? styles.cloud : styles.inline}>
      {tags.map((tag) => {
        const count = counts?.[tag];
        return (
          <li key={tag}>
            <Link
              href={`/tags/${tag}`}
              className={variant === "cloud" ? styles[`level${cloudLevel(count ?? 1, max)}`] : undefined}
            >
              {tagNames[tag]}
            </Link>
            {count !== undefined && <span className={styles.count}>({count})</span>}
          </li>
        );
      })}
    </ul>
  );
}
