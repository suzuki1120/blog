import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton/CopyButton";
import { links } from "@/config/links";
import { siteConfig } from "@/config/site";
import { alternates } from "@/lib/metadata";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "リンク集",
  alternates: alternates("/links"),
};

const bannerHtml = `<a href="${siteConfig.url}/"><img src="${siteConfig.url}/banner.png" width="88" height="31" alt="${siteConfig.name}"></a>`;

export default function LinksPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>
        <span aria-hidden="true">■ </span>リンク集
      </h1>

      <section aria-labelledby="links-sites" className={styles.box}>
        <h2 id="links-sites" className={styles.boxHeading}>
          よく見ているサイト
        </h2>
        <ul className={styles.sites}>
          {links.map((site) => (
            <li key={site.url}>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.bannerLink}>
                {site.banner ? (
                  // 外部の小さなバナーは最適化しないので img をそのまま使う
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={site.banner} width={88} height={31} alt={site.name} className={styles.banner} />
                ) : (
                  <span className={styles.textBanner}>{site.name}</span>
                )}
              </a>
              <p className={styles.description}>{site.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="links-free" className={styles.box}>
        <h2 id="links-free" className={styles.boxHeading}>
          当サイトについて
        </h2>
        <p>当サイトはリンクフリーです。連絡は不要です。バナーはお持ち帰りください（直リンクでも構いません）。</p>
        <dl className={styles.info}>
          <div>
            <dt>サイト名</dt>
            <dd>{siteConfig.name}</dd>
          </div>
          <div>
            <dt>URL</dt>
            <dd>{siteConfig.url}/</dd>
          </div>
          <div>
            <dt>バナー</dt>
            <dd>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/banner.png" width={88} height={31} alt={`${siteConfig.name} のバナー`} className={styles.banner} />
            </dd>
          </div>
        </dl>
        <div className={styles.snippet}>
          <pre>
            <code>{bannerHtml}</code>
          </pre>
          <CopyButton text={bannerHtml} label="HTML をコピー" />
        </div>
      </section>
    </div>
  );
}
