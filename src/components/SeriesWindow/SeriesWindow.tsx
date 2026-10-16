import Link from "next/link";
import type { Post } from "@/lib/posts";
import styles from "./SeriesWindow.module.scss";

type Props = {
  name: string;
  href: string;
  /** 第 1 回から順に並べたシリーズの記事 */
  posts: Post[];
  currentSlug: string;
};

/** 連載の記事一覧。現在の記事を選択行の色で示し、前後の回へのボタンを置く */
export function SeriesWindow({ name, href, posts, currentSlug }: Props) {
  const index = posts.findIndex((post) => post.slug === currentSlug);
  const prev = index > 0 ? posts[index - 1] : undefined;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <section className={styles.window} aria-labelledby="series-title">
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <h2 id="series-title" className={styles.title}>
          連載: {name}（第 {index + 1} 回 / 全 {posts.length} 回）
        </h2>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>

      <ol className={styles.pane}>
        {posts.map((post, i) => (
          <li key={post.slug}>
            <span className={styles.number}>第 {i + 1} 回</span>
            {post.slug === currentSlug ? (
              <span className={styles.current} aria-current="page">
                {post.title}
              </span>
            ) : (
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            )}
          </li>
        ))}
      </ol>

      <nav aria-label={`連載「${name}」の前後の回`} className={styles.buttons}>
        {prev ? (
          <Link href={`/posts/${prev.slug}`} rel="prev" title={prev.title} className={styles.button}>
            &lt; 前の回
          </Link>
        ) : (
          <span className={`${styles.button} ${styles.disabled}`} aria-hidden="true">
            &lt; 前の回
          </span>
        )}
        <Link href={href} className={styles.button}>
          連載の一覧
        </Link>
        {next ? (
          <Link href={`/posts/${next.slug}`} rel="next" title={next.title} className={styles.button}>
            次の回 &gt;
          </Link>
        ) : (
          <span className={`${styles.button} ${styles.disabled}`} aria-hidden="true">
            次の回 &gt;
          </span>
        )}
      </nav>
    </section>
  );
}
