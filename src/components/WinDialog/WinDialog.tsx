"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./WinDialog.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 画像の拡大表示など、中身に合わせて幅を広げるとき */
  wide?: boolean;
};

/**
 * Win98 のダイアログ。<dialog> の showModal を使うので、
 * フォーカスの閉じ込めと Esc で閉じる動きはブラウザに任せる
 */
export function WinDialog({ open, onClose, title, children, wide }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${wide ? styles.wide : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className={styles.titlebar}>
        {/* 記事本文の中でも本文の見出しの装飾が付かないよう、見出し要素にはしない（名前は aria-labelledby で付ける） */}
        <p id={titleId} className={styles.title}>
          {title}
        </p>
        <button type="button" className={styles.close} onClick={onClose} aria-label="閉じる">
          ×
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
