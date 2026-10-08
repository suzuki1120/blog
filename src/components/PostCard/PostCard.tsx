import Link from "next/link";
import { categories } from "@/config/taxonomy";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/posts";
import { TagList } from "../TagList/TagList";
import styles from "./PostCard.module.scss";

// ビルド時点から 14 日以内の記事に「NEW!」を付ける
const NEW_DAYS = 14;
const builtAt = Date.now();

function isNew(date: string): boolean {
  return builtAt - Date.parse(`${date}T00:00:00+09:00`) < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function PostCard({ post }: { post: Post }) {
  const href = `/posts/${post.slug}`;
  return (
    <article className={styles.card}>
      <p className={styles.date}>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <h2 className={styles.title}>
        <span aria-hidden="true">▼</span>
        <Link href={href}>{post.title}</Link>
        {isNew(post.date) && <span className={styles.new}>NEW!</span>}
        {post.draft && <span className={styles.draft}>下書き</span>}
      </h2>
      <p className={styles.description}>{post.description}</p>
      <p className={styles.more}>
        <Link href={href}>続きを読む »</Link>
      </p>
      <ul className={styles.footer}>
        <li>
          カテゴリ: <Link href={`/categories/${post.category}`}>{categories[post.category]}</Link>
        </li>
        {post.tags.length > 0 && (
          <li>
            タグ: <TagList tags={post.tags} />
          </li>
        )}
        <li>
          <Link href={href}>固定リンク</Link>
        </li>
      </ul>
    </article>
  );
}
