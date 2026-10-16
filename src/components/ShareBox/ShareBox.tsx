import { CopyButton } from "@/components/CopyButton/CopyButton";
import styles from "./ShareBox.module.scss";

/** 「このファイルを共有」ダイアログ。各サービスの投稿画面へのリンクと URL のコピーだけで、外部のスクリプトは読み込まない */
export function ShareBox({ title, url }: { title: string; url: string }) {
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const services = [
    { name: "X でポスト", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { name: "Bluesky で共有", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: "はてなブックマーク", href: `https://b.hatena.ne.jp/add?mode=confirm&url=${u}&title=${t}` },
  ];

  return (
    <section className={styles.window} aria-labelledby="share-title">
      <div className={styles.titlebar}>
        <h2 id="share-title" className={styles.title}>
          このファイルを共有
        </h2>
        <span className={styles.controls} aria-hidden="true">
          <span>?</span>
          <span>×</span>
        </span>
      </div>
      <div className={styles.body}>
        <p className={styles.url}>
          <span className={styles.label}>URL:</span>
          <span className={styles.field}>{url}</span>
        </p>
        <ul className={styles.buttons}>
          {services.map((service) => (
            <li key={service.name}>
              <a href={service.href} target="_blank" rel="noopener noreferrer" className={styles.button}>
                {service.name}
              </a>
            </li>
          ))}
          <li>
            <CopyButton text={url} label="URL をコピー" />
          </li>
        </ul>
      </div>
    </section>
  );
}
