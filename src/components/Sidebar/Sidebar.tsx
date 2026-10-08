import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getAllPosts, getUsedCategories, getUsedTags } from "@/lib/posts";
import { Calendar } from "../Calendar/Calendar";
import { TagList } from "../TagList/TagList";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
  const posts = getAllPosts();
  const usedTags = getUsedTags();
  const tagCounts = Object.fromEntries(usedTags.map((t) => [t.slug, t.count]));

  return (
    <aside className={styles.sidebar} aria-label="サイドバー">
      <section className={styles.box}>
        <h2 className={styles.heading}>プロフィール</h2>
        <p className={styles.author}>{siteConfig.author}</p>
        <p className={styles.note}>{siteConfig.description}</p>
      </section>

      <section className={styles.box}>
        <h2 className={styles.heading}>カレンダー</h2>
        <Calendar posts={posts} />
      </section>

      <section className={styles.box}>
        <h2 className={styles.heading}>最新記事</h2>
        <ul className={styles.list}>
          {posts.slice(0, 5).map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.box}>
        <h2 className={styles.heading}>カテゴリ</h2>
        <ul className={styles.list}>
          {getUsedCategories().map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`}>{c.name}</Link>
              <span className={styles.count}> ({c.count})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.box}>
        <h2 className={styles.heading}>タグクラウド</h2>
        <TagList tags={usedTags.map((t) => t.slug)} counts={tagCounts} variant="cloud" />
      </section>

      <section className={styles.box}>
        <h2 className={styles.heading}>RSS</h2>
        <p className={styles.note}>
          <a href="/feed.xml">最新記事の RSS</a>
        </p>
      </section>
    </aside>
  );
}
