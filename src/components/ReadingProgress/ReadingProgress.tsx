"use client";

import { useEffect, useState } from "react";
import styles from "./ReadingProgress.module.scss";

type Props = {
  /** 例: "コードブロックの書き方.mdx" */
  name: string;
  /** 読了目安（分）。残り時間の計算に使う */
  minutes: number;
  /** 読み進み具合を測る本文の要素の id */
  targetId: string;
};

/**
 * 読み進み具合を Win98 のファイル転送ダイアログ風に出す。割合はスクロール量、残り時間は読了目安から計算する。
 * 本文が 1 画面に収まる記事と、本文を読み始める前は出さない。自分では動かず、スクロールに合わせて変わるだけ
 */
export function ReadingProgress({ name, minutes, targetId }: Props) {
  const [percent, setPercent] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const body = document.getElementById(targetId);
    if (!body) return;
    let frame = 0;

    function update() {
      frame = 0;
      const rect = body!.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.height <= viewport || rect.top > viewport / 2) {
        setPercent(null);
        return;
      }
      const read = Math.min(Math.max((viewport - rect.top) / rect.height, 0), 1);
      setPercent(Math.round(read * 100));
    }

    // スクロールのたびに計算せず、描画のタイミングで 1 回だけ計算する
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetId]);

  if (percent === null || closed) return null;

  const done = percent >= 100;
  const remaining = Math.max(1, Math.ceil((minutes * (100 - percent)) / 100));

  return (
    <aside className={styles.dialog} aria-label="読み進み具合">
      <div className={styles.titlebar}>
        <span className={styles.title}>
          {done ? "転送完了" : `${percent}% - 転送中`} - {name}
        </span>
        <button type="button" className={styles.close} onClick={() => setClosed(true)} aria-label="読み進み具合を閉じる">
          ×
        </button>
      </div>
      <div className={styles.body}>
        <div
          role="progressbar"
          aria-label="読んだ割合"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className={styles.bar}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className={styles.info}>{done ? "転送が完了しました。" : `残り時間: 約 ${remaining} 分`}</p>
      </div>
    </aside>
  );
}
