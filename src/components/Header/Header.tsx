import Link from "next/link";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { logoArt, logoColumns } from "./logoArt";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      {/* pre は p の中に置けないので div で包む */}
      <div className={styles.logo} style={{ "--logo-columns": logoColumns } as CSSProperties}>
        <Link href="/">
          <pre aria-hidden="true">{logoArt}</pre>
          <span className="visually-hidden">{siteConfig.name}</span>
        </Link>
      </div>
      <p className={styles.sub}>
        <span aria-hidden="true">-=[ </span>
        {siteConfig.description}
        <span aria-hidden="true"> ]=-</span>
      </p>
      <div className={styles.ticker} aria-hidden="true">
        <p>
          ★☆★ Welcome to {siteConfig.name} ★☆★ 記事はこの下の一覧から読めます。検索欄にキーワードを入れると全記事から探せます。
          ★ RSS で更新をお知らせしています ★ 推奨環境：IE 5.5 以上 / 800×600 / 256 色 ★
        </p>
      </div>
    </header>
  );
}
