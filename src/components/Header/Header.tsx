import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {siteConfig.name}
        </Link>
        <nav aria-label="メインメニュー">
          <ul className={styles.nav}>
            <li>
              <Link href="/">記事一覧</Link>
            </li>
            <li>
              <Link href="/tags">タグ</Link>
            </li>
            <li>
              <a href="/feed.xml">RSS</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
