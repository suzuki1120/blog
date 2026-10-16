"use client";

import Link from "next/link";
import { recentStore } from "@/lib/recent";
import styles from "./Menu.module.scss";

/** 左メニューの「最近使ったファイル」。履歴がないとき（初回・JS が動く前）は何も出さない */
export function RecentFiles() {
  const files = recentStore.useValue();
  if (files.length === 0) return null;
  return (
    <nav aria-labelledby="menu-recent" className={`${styles.box} ${styles.folders}`}>
      <h2 id="menu-recent" className={styles.heading}>
        最近使ったファイル
      </h2>
      <ol className={styles.recentList}>
        {files.map((file, i) => (
          <li key={file.slug}>
            <span className={styles.recentNo} aria-hidden="true">
              {i + 1}
            </span>
            <Link href={`/posts/${file.slug}`}>{file.title}</Link>
          </li>
        ))}
      </ol>
      <p className={styles.clear}>
        <button type="button" onClick={() => recentStore.write([])}>
          履歴を消す
        </button>
      </p>
    </nav>
  );
}
