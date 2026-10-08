import { siteConfig } from "@/config/site";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.toTop}>
        <a href="#top">▲ページの先頭へ</a>
      </p>
      <ul className={styles.badges}>
        <li>
          <a href="/feed.xml" className={`${styles.badge} ${styles.rss}`}>
            <span>RSS</span>2.0
          </a>
        </li>
        <li>
          <span className={`${styles.badge} ${styles.next}`}>
            <span>Next</span>.js
          </span>
        </li>
        <li>
          <span className={`${styles.badge} ${styles.cf}`}>
            <span>CF</span>Workers
          </span>
        </li>
      </ul>
      <p className={styles.copyright}>
        <small>
          Copyright &copy; {new Date().getFullYear()} {siteConfig.author} All Rights Reserved.
        </small>
      </p>
      <p className={styles.powered}>Powered by Next.js / Cloudflare Workers</p>
    </footer>
  );
}
