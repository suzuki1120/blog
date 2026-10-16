import Link from "next/link";
import { siteConfig } from "@/config/site";
import styles from "./LinkCard.module.scss";

type Props = {
  href: string;
  title: string;
  description?: string;
};

/** 記事内のリンクカード。Windows のショートカット（.lnk）風に出す（MDX で <LinkCard> として使う） */
export function LinkCard({ href, title, description }: Props) {
  const internal = href.startsWith("/");
  const url = new URL(href, siteConfig.url);
  const target = `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  return (
    <div className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        <span className={styles.arrow} />
      </span>
      <div className={styles.text}>
        {internal ? (
          <Link href={href} className={styles.link}>
            {title}
          </Link>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {title}
          </a>
        )}
        <span className={styles.ext} aria-hidden="true">
          .lnk
        </span>
        {description && <p className={styles.description}>{description}</p>}
        <p className={styles.target}>
          <span className={styles.label}>リンク先:</span> {target}
        </p>
      </div>
    </div>
  );
}
