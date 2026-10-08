import Link from "next/link";
import styles from "./Pagination.module.scss";

type Props = {
  currentPage: number;
  totalPages: number;
  /** 1 ページ目の URL（例: "/", "/tags/nextjs"）。2 ページ目以降は `${basePath}/page/N` */
  basePath: string;
};

export function pageHref(basePath: string, page: number): string {
  const base = basePath === "/" ? "" : basePath;
  return page === 1 ? basePath : `${base}/page/${page}`;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="ページ送り" className={styles.pagination}>
      {currentPage > 1 ? (
        <Link href={pageHref(basePath, currentPage - 1)} className={styles.step} rel="prev">
          ← 前へ
        </Link>
      ) : (
        <span className={styles.step} aria-hidden="true" />
      )}
      <ol className={styles.pages}>
        {pages.map((page) => (
          <li key={page}>
            {page === currentPage ? (
              <span className={styles.current} aria-current="page">
                {page}
              </span>
            ) : (
              <Link href={pageHref(basePath, page)} className={styles.page}>
                {page}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {currentPage < totalPages ? (
        <Link href={pageHref(basePath, currentPage + 1)} className={styles.step} rel="next">
          次へ →
        </Link>
      ) : (
        <span className={styles.step} aria-hidden="true" />
      )}
    </nav>
  );
}
