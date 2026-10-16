import Link from "next/link";
import { getUsedCategories, getUsedSeries, getUsedTags } from "@/lib/posts";
import styles from "./Menu.module.scss";
import { RecentFiles } from "./RecentFiles";

/** 旧フレームサイト風の左メニュー */
export function Menu() {
  return (
    <aside className={styles.menu} aria-label="メニュー">
      <nav aria-labelledby="menu-heading" className={styles.box}>
        <h2 id="menu-heading" className={styles.heading}>
          MENU
        </h2>
        <ul className={styles.links}>
          <li>
            <Link href="/">TOP</Link>
          </li>
          <li>
            <Link href="/tags">フォルダ一覧</Link>
          </li>
          <li>
            <Link href="/archives">過去ログ</Link>
          </li>
          <li>
            <Link href="/about">プロフィール</Link>
          </li>
          <li>
            <Link href="/links">リンク集</Link>
          </li>
          <li>
            <a href="/feed.xml">RSS</a>
          </li>
        </ul>
      </nav>

      <RecentFiles />

      <nav aria-labelledby="menu-categories" className={`${styles.box} ${styles.folders}`}>
        <h2 id="menu-categories" className={styles.heading}>
          種類
        </h2>
        <ul className={styles.folderList}>
          {getUsedCategories().map((c) => (
            <li key={c.slug}>
              <span className={styles.folderIcon} aria-hidden="true" />
              <Link href={`/categories/${c.slug}`}>{c.name}</Link>
              <span className={styles.count}>({c.count})</span>
            </li>
          ))}
        </ul>
      </nav>

      {getUsedSeries().length > 0 && (
        <nav aria-labelledby="menu-series" className={`${styles.box} ${styles.folders}`}>
          <h2 id="menu-series" className={styles.heading}>
            連載
          </h2>
          <ul className={styles.folderList}>
            {getUsedSeries().map((s) => (
              <li key={s.slug}>
                <span className={styles.folderIcon} aria-hidden="true" />
                <Link href={`/series/${s.slug}`}>{s.name}</Link>
                <span className={styles.count}>({s.count})</span>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav aria-labelledby="menu-tags" className={`${styles.box} ${styles.folders}`}>
        <h2 id="menu-tags" className={styles.heading}>
          タグ
        </h2>
        <ul className={styles.folderList}>
          {getUsedTags().map((t) => (
            <li key={t.slug}>
              <span className={styles.folderIcon} aria-hidden="true" />
              <Link href={`/tags/${t.slug}`}>{t.name}</Link>
              <span className={styles.count}>({t.count})</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
