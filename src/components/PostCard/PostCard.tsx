import Link from "next/link";
import { categories } from "@/config/taxonomy";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/posts";
import { TagList } from "../TagList/TagList";
import styles from "./PostCard.module.scss";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className={styles.card}>
      <div className={styles.meta}>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <Link href={`/categories/${post.category}`} className={styles.category}>
          {categories[post.category]}
        </Link>
        {post.draft && <span className={styles.draft}>下書き</span>}
      </div>
      <h2 className={styles.title}>
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className={styles.description}>{post.description}</p>
      <TagList tags={post.tags} />
    </article>
  );
}
