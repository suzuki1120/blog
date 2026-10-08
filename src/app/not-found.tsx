import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.code} aria-hidden="true">
        404 Not Found
      </p>
      <h1 className={styles.title}>ページが見つかりません</h1>
      <p>URL が間違っているか、記事が削除された可能性があります。</p>
      <p>
        <Link href="/">» トップページへ戻る</Link>
      </p>
    </div>
  );
}
