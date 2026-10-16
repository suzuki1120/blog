import Link from "next/link";
import { siteConfig } from "@/config/site";
import { formatSlashDate, totalSize } from "@/lib/files";
import { getAllPosts, getUsedCategories, getUsedTags } from "@/lib/posts";
import styles from "./UserInfo.module.scss";

/** WinMX の「ユーザー情報」画面風のプロフィール。数値は記事のデータから出す */
export function UserInfo() {
  const posts = getAllPosts();
  const first = posts.at(-1)?.date;
  const latest = posts[0]?.updated ?? posts[0]?.date;
  const { bio, links } = siteConfig.profile;

  return (
    <section className={styles.window} aria-labelledby="user-info-title">
      <div className={styles.titlebar}>
        <span className={styles.userIcon} aria-hidden="true" />
        <h1 id="user-info-title" className={styles.title}>
          ユーザー情報 - {siteConfig.author}
        </h1>
        <span className={styles.controls} aria-hidden="true">
          <span>?</span>
          <span>×</span>
        </span>
      </div>

      <div className={styles.body}>
        <fieldset className={styles.group}>
          <legend>基本情報</legend>
          <dl className={styles.props}>
            <div>
              <dt>ユーザー名</dt>
              <dd>{siteConfig.author}</dd>
            </div>
            <div>
              <dt>コメント</dt>
              <dd>{bio}</dd>
            </div>
            {links.length > 0 && (
              <div>
                <dt>リンク</dt>
                <dd>
                  <ul className={styles.inline}>
                    {links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer me">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>共有情報</legend>
          <dl className={styles.props}>
            <div>
              <dt>共有ファイル数</dt>
              <dd>
                {posts.length} 個（合計 {totalSize(posts)}）
              </dd>
            </div>
            {first && (
              <div>
                <dt>共有開始日</dt>
                <dd>
                  <time dateTime={first}>{formatSlashDate(first)}</time>
                </dd>
              </div>
            )}
            {latest && (
              <div>
                <dt>最終更新</dt>
                <dd>
                  <time dateTime={latest}>{formatSlashDate(latest)}</time>
                </dd>
              </div>
            )}
            <div>
              <dt>種類</dt>
              <dd>
                <ul className={styles.inline}>
                  {getUsedCategories().map((c) => (
                    <li key={c.slug}>
                      <Link href={`/categories/${c.slug}`}>{c.name}</Link>（{c.count}）
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>よく使うタグ</dt>
              <dd>
                <ul className={styles.inline}>
                  {getUsedTags()
                    .slice(0, 5)
                    .map((t) => (
                      <li key={t.slug}>
                        <Link href={`/tags/${t.slug}`}>{t.name}</Link>（{t.count}）
                      </li>
                    ))}
                </ul>
              </dd>
            </div>
          </dl>
        </fieldset>

        <p className={styles.buttons}>
          <Link href="/" className={styles.button}>
            共有ファイルを見る
          </Link>
          <a href="/feed.xml" className={styles.button}>
            RSS
          </a>
        </p>
      </div>
    </section>
  );
}
