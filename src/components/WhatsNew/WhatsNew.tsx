import Link from "next/link";
import { getUpdates, isNewPost } from "@/lib/posts";
import styles from "./WhatsNew.module.scss";

/** TOP の更新履歴。記事の公開（新規）と `updated`（更新）を新しい順に並べる */
export function WhatsNew() {
  const updates = getUpdates();
  if (updates.length === 0) return null;
  return (
    <section aria-labelledby="whats-new" className={styles.box}>
      <h2 id="whats-new" className={styles.heading}>
        What&apos;s New!
      </h2>
      <ul className={styles.updates}>
        {updates.map(({ post, date, kind }) => (
          <li key={`${post.slug}-${kind}`}>
            <time dateTime={date} className={styles.date}>
              {date.replaceAll("-", "/")}
            </time>
            <span className={styles.kind}>[{kind}]</span>
            <span className={styles.title}>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
              {isNewPost(date) && <span className={styles.new}>NEW!</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
