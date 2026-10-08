import Link from "next/link";
import styles from "./FolderWindow.module.scss";

type Folder = { href: string; name: string; count: number };

type Props = {
  title: string;
  sections: { heading: string; folders: Folder[] }[];
};

/** エクスプローラー風のフォルダ一覧（大きいアイコン表示） */
export function FolderWindow({ title, sections }: Props) {
  const total = sections.reduce((sum, s) => sum + s.folders.length, 0);
  return (
    <section className={styles.window} aria-labelledby="folder-window-title">
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <h1 id="folder-window-title" className={styles.title}>
          {title}
        </h1>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>

      <div className={styles.pane}>
        {sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.heading}>{section.heading}</h2>
            <ul className={styles.grid}>
              {section.folders.map((folder) => (
                <li key={folder.href}>
                  <Link href={folder.href} className={styles.folder}>
                    <span className={styles.bigIcon} aria-hidden="true" />
                    <span className={styles.name}>{folder.name}</span>
                    <span className={styles.count}>{folder.count} 個のファイル</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className={styles.status}>
        <span>{total} 個のフォルダ</span>
      </p>
    </section>
  );
}
