import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>ページが見つかりません</h1>
      <p>URL が間違っているか、記事が削除された可能性があります。</p>
      <p>
        <Link href="/">記事一覧へ戻る</Link>
      </p>
    </div>
  );
}
