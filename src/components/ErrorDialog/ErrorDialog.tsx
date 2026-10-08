import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ErrorDialog.module.scss";

type Props = {
  title: string;
  heading: string;
  children: ReactNode;
  /** 「OK」ボタンの移動先 */
  href: string;
};

/** Win98 のエラーダイアログ風の表示 */
export function ErrorDialog({ title, heading, children, href }: Props) {
  return (
    <section className={styles.dialog} aria-labelledby="error-dialog-heading">
      <div className={styles.titlebar}>
        <p className={styles.title}>{title}</p>
        <span className={styles.controls} aria-hidden="true">
          <span>×</span>
        </span>
      </div>
      <div className={styles.body}>
        <span className={styles.icon} aria-hidden="true">
          ×
        </span>
        <div className={styles.message}>
          <h1 id="error-dialog-heading" className={styles.heading}>
            {heading}
          </h1>
          {children}
        </div>
      </div>
      <p className={styles.actions}>
        <Link href={href} className={styles.button}>
          OK
        </Link>
      </p>
    </section>
  );
}
