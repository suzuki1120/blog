import { ErrorDialog } from "@/components/ErrorDialog/ErrorDialog";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.code} aria-hidden="true">
        404 Not Found
      </p>
      <ErrorDialog title="エラー" heading="ファイルが見つかりません。" href="/">
        <p>URL が間違っているか、ファイルが削除された可能性があります。</p>
        <p>OK を押すとトップページへ戻ります。</p>
      </ErrorDialog>
    </div>
  );
}
