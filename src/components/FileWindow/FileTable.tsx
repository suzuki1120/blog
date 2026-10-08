import Link from "next/link";
import { formatSlashDate, type FileRow } from "@/lib/file-row";
import styles from "./FileWindow.module.scss";

/** 検索結果の表。通常の一覧とキーワード検索の結果の両方で使う */
export function FileTable({ rows, empty }: { rows: FileRow[]; empty: string }) {
  return (
    <div className={styles.list}>
      <table>
        <thead>
          <tr>
            <th scope="col">ファイル名</th>
            <th scope="col" className={styles.size}>
              サイズ
            </th>
            <th scope="col" className={styles.hash}>
              ID
            </th>
            <th scope="col">日付</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug}>
              <td className={styles.name}>
                <span className={styles.fileIcon} aria-hidden="true" />
                <Link href={`/posts/${row.slug}`}>{row.name}</Link>
                {row.isNew && <span className={styles.new}>NEW!</span>}
                {row.draft && <span className={styles.draft}>下書き</span>}
              </td>
              <td className={styles.size}>{row.size}</td>
              <td className={styles.hash}>{row.hash}</td>
              <td className={styles.date}>
                <time dateTime={row.date}>{formatSlashDate(row.date)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className={styles.empty}>{empty}</p>}
    </div>
  );
}
