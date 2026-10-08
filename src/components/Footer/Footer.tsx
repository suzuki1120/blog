import { siteConfig } from "@/config/site";
import { formatSlashDate } from "@/lib/file-row";
import { getAllPosts } from "@/lib/posts";
import styles from "./Footer.module.scss";

export function Footer() {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? posts[0]?.date;
  return (
    <footer className={styles.footer}>
      <dl className={styles.counters}>
        <div>
          <dt>収録ファイル数</dt>
          <dd className={styles.digits}>{String(posts.length).padStart(6, "0")}</dd>
        </div>
        {latest && (
          <div>
            <dt>最終更新</dt>
            <dd className={styles.digits}>
              <time dateTime={latest}>{formatSlashDate(latest)}</time>
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="notice-heading" className={styles.notice}>
        <h2 id="notice-heading" className={styles.noticeHeading}>
          !! 注意事項 !!
        </h2>
        <ul>
          <li>当サイトの文章の無断転載はご遠慮ください。</li>
          <li>記事の内容は書いた時点のものです。最新の情報は公式ドキュメントで確認してください。</li>
        </ul>
      </section>

      <p className={styles.toTop}>
        <a href="#top">▲ TOP</a>
      </p>
      <p className={styles.copyright}>
        <small>
          Copyright (C) {new Date().getFullYear()} {siteConfig.author}
        </small>
        <br />
        Powered by Next.js / Cloudflare Workers
      </p>
    </footer>
  );
}
