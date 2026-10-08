import Link from "next/link";
import { tags as tagNames, type TagSlug } from "@/config/taxonomy";
import styles from "./TagList.module.scss";

type Props = {
  tags: readonly TagSlug[];
  counts?: Partial<Record<TagSlug, number>>;
};

export function TagList({ tags, counts }: Props) {
  if (tags.length === 0) return null;
  return (
    <ul className={styles.list}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/tags/${tag}`} className={styles.tag}>
            #{tagNames[tag]}
            {counts?.[tag] !== undefined && <span className={styles.count}>{counts[tag]}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
