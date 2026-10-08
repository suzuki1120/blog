import type { ReactNode } from "react";
import type { Paginated, Post } from "@/lib/posts";
import { Pagination } from "../Pagination/Pagination";
import { PostList } from "../PostList/PostList";
import styles from "./ListPage.module.scss";

type Props = {
  title?: ReactNode;
  lead?: ReactNode;
  page: Paginated<Post>;
  basePath: string;
};

/** トップ・カテゴリ・タグの一覧ページ共通レイアウト */
export function ListPage({ title, lead, page, basePath }: Props) {
  return (
    <div className={styles.wrapper}>
      {title && (
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </header>
      )}
      <PostList posts={page.items} />
      <Pagination currentPage={page.currentPage} totalPages={page.totalPages} basePath={basePath} />
    </div>
  );
}
