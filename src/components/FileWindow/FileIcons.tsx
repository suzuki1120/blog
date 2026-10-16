import Link from "next/link";
import type { FileRow } from "@/lib/file-row";
import styles from "./FileWindow.module.scss";

/** エクスプローラーの「一覧」「大きいアイコン」表示。並び順は渡した rows のまま */
export function FileIcons({ rows, mode, empty }: { rows: FileRow[]; mode: "list" | "icons"; empty: string }) {
  return (
    <div className={styles.list}>
      <ul className={mode === "icons" ? styles.iconGrid : styles.nameList}>
        {rows.map((row) => (
          <li key={row.slug}>
            <Link href={`/posts/${row.slug}`} className={styles.iconItem} data-file-link="">
              <span className={mode === "icons" ? styles.bigFileIcon : styles.fileIcon} aria-hidden="true" />
              <span className={styles.iconName}>
                {row.name}
                {row.isNew && <span className={styles.new}>NEW!</span>}
                {row.draft && <span className={styles.draft}>下書き</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className={styles.empty}>{empty}</p>}
    </div>
  );
}
