"use client";

import Image from "next/image";
import { useState } from "react";
import { WinDialog } from "@/components/WinDialog/WinDialog";
import styles from "./ImageViewer.module.scss";

type Props = {
  src: string;
  alt: string;
  /** 画像の実際の大きさ（px）。表示前に場所を確保するため必須 */
  width: number;
  height: number;
  caption?: string;
};

/**
 * 記事内の画像。Win98 の画像ビューア風のウィンドウに入れ、押すと拡大表示する（MDX で <ImageViewer> として使う）。
 * JS が動く前は、画像そのものへのリンクとして働く
 */
export function ImageViewer({ src, alt, width, height, caption }: Props) {
  const [open, setOpen] = useState(false);
  const name = src.split("/").pop() ?? src;
  const title = `${name} - 画像ビューア`;

  return (
    <figure className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <span className={styles.title}>{title}</span>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <a
        href={src}
        className={styles.view}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <Image src={src} alt={alt} width={width} height={height} className={styles.image} />
        <span className="visually-hidden">（拡大して表示）</span>
      </a>
      <p className={styles.status}>
        <span>
          {width} × {height} ピクセル
        </span>
        <span>クリックで拡大</span>
      </p>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}

      <WinDialog open={open} onClose={() => setOpen(false)} title={title} wide>
        <Image src={src} alt={alt} width={width} height={height} className={styles.full} />
      </WinDialog>
    </figure>
  );
}
