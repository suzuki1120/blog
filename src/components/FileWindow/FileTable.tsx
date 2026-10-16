import Link from "next/link";
import { formatSlashDate, type FileRow } from "@/lib/file-row";
import styles from "./FileWindow.module.scss";

export type SortKey = "name" | "size" | "hash" | "date";
export type Sort = { key: SortKey; dir: "asc" | "desc" };

const columns: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "ファイル名" },
  { key: "size", label: "サイズ", className: styles.size },
  { key: "hash", label: "ID", className: styles.hash },
  { key: "date", label: "日付" },
];

type Props = {
  rows: FileRow[];
  empty: string;
  /** 渡したときだけ、列の見出しを押して並べ替えられるようにする */
  sort?: Sort;
  onSort?: (key: SortKey) => void;
};

/** 検索結果の表。通常の一覧・キーワード検索の結果・関連記事で使う */
export function FileTable({ rows, empty, sort, onSort }: Props) {
  return (
    <div className={styles.list}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={col.className}
                  aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {onSort ? (
                    <button type="button" className={styles.sortButton} onClick={() => onSort(col.key)}>
                      {col.label}
                      <span className={styles.sortMark} aria-hidden="true">
                        {active ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug}>
              <td className={styles.name}>
                <span className={styles.fileIcon} aria-hidden="true" />
                <Link href={`/posts/${row.slug}`} data-file-link="">
                  {row.name}
                </Link>
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
