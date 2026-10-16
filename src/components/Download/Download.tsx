import styles from "./Download.module.scss";

type Props = {
  /** public/ に置いたファイルの URL（例: /files/sample.zip） */
  href: string;
  /** 表示するファイル名。省略すると URL の最後の部分 */
  name?: string;
  /** 例: "12 KB"。サイトの外のファイルなどで分からなければ省略する */
  size?: string;
  description?: string;
};

/** 配布ファイルへのリンク。WinMX の転送リストの 1 行風に出す（MDX で <Download> として使う） */
export function Download({ href, name, size, description }: Props) {
  const fileName = name ?? href.split("/").pop() ?? href;
  return (
    <section className={styles.window} aria-label={`ダウンロード: ${fileName}`}>
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <span className={styles.title}>転送 - 1 個のファイル</span>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <div className={styles.list}>
        <table>
          <thead>
            <tr>
              <th scope="col">ファイル名</th>
              <th scope="col" className={styles.size}>
                サイズ
              </th>
              <th scope="col" className={styles.note}>
                説明
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.name}>
                <span className={styles.fileIcon} aria-hidden="true" />
                {fileName}
              </td>
              <td className={styles.size}>{size ?? "-"}</td>
              <td className={styles.note}>{description ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.actions}>
        <a href={href} download={fileName} className={styles.button}>
          ダウンロード
        </a>
      </p>
    </section>
  );
}
