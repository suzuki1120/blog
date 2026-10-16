import type { FileRow } from "@/lib/file-row";
import { FileTable } from "./FileTable";
import styles from "./FileWindow.module.scss";

/** 記事ページ下の関連記事。検索欄とページ送りのない、小さな検索結果ウィンドウ */
export function RelatedFiles({ rows }: { rows: FileRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className={styles.window} aria-labelledby="related-title">
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <h2 id="related-title" className={styles.title}>
          関連ファイル - {rows.length} 件
        </h2>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <FileTable rows={rows} empty="" />
      <p className={styles.status}>
        <span>同じタグを持つファイル</span>
      </p>
    </section>
  );
}
