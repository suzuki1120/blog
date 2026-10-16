import type { ReactNode } from "react";
import styles from "./MessageBox.module.scss";

type Kind = "info" | "warning" | "error";

const labels: Record<Kind, string> = { info: "情報", warning: "警告", error: "エラー" };
const marks: Record<Kind, string> = { info: "i", warning: "!", error: "×" };

type Props = {
  type?: Kind;
  /** タイトルバーの文字。省略すると種類の名前（情報・警告・エラー） */
  title?: string;
  children: ReactNode;
};

/** 記事内の補足・注意書き。Win98 のメッセージボックス風に出す（MDX で <MessageBox> として使う） */
export function MessageBox({ type = "info", title, children }: Props) {
  const label = title ?? labels[type];
  return (
    <aside className={styles.box} aria-label={label}>
      <div className={styles.titlebar}>
        <span className={styles.title}>{label}</span>
        <span className={styles.controls} aria-hidden="true">
          <span>×</span>
        </span>
      </div>
      <div className={styles.body}>
        <span className={`${styles.icon} ${styles[type]}`} aria-hidden="true">
          {marks[type]}
        </span>
        <div className={styles.message}>{children}</div>
      </div>
    </aside>
  );
}
