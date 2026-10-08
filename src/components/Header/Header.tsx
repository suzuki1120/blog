import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.banner}>
        <p className={styles.logo}>
          <Link href="/">
            <span aria-hidden="true">☆ </span>
            {siteConfig.name}
            <span aria-hidden="true"> ☆</span>
          </Link>
        </p>
        <p className={styles.tagline}>～ {siteConfig.description} ～</p>
      </div>
      <nav aria-label="メインメニュー" className={styles.nav}>
        <ul>
          <li>
            <Link href="/">HOME</Link>
          </li>
          <li>
            <Link href="/tags">カテゴリ・タグ一覧</Link>
          </li>
          <li>
            <a href="/feed.xml">RSS</a>
          </li>
        </ul>
      </nav>
      <div className={styles.ticker} aria-hidden="true">
        <p>
          ようこそ！ {siteConfig.name} へ。最新記事はこの下から読めます。RSS でも更新をお知らせしています。
        </p>
      </div>
    </header>
  );
}
