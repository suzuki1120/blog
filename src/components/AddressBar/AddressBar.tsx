import Link from "next/link";
import styles from "./AddressBar.module.scss";

export type Crumb = { name: string; href?: string };

/** エクスプローラーのアドレスバー風のパンくずリスト。最後の項目が現在のページ */
export function AddressBar({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className={styles.bar}>
      <span className={styles.label} aria-hidden="true">
        アドレス(D)
      </span>
      <ol className={styles.field}>
        {items.map((item, i) => (
          <li key={i} aria-current={i === items.length - 1 ? "page" : undefined}>
            {i === 0 && <span className={styles.drive} aria-hidden="true" />}
            {item.href && i < items.length - 1 ? <Link href={item.href}>{item.name}</Link> : <span>{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
