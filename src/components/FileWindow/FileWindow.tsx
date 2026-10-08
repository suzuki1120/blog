"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { normalizeForSearch, type FileRow, type SearchRow } from "@/lib/file-row";
import { FileTable } from "./FileTable";
import styles from "./FileWindow.module.scss";

type Pager = {
  currentPage: number;
  totalPages: number;
  perPage: number;
  prevHref?: string;
  nextHref?: string;
};

type Props = {
  /** 例: "検索結果 - 42 件"、"検索結果: 種類=技術 - 5 件" */
  title: string;
  /** このページに表示する行 */
  rows: FileRow[];
  /** 一覧全体（全ページ）の件数と合計サイズ */
  total: number;
  totalSize: string;
  pager: Pager;
};

type IndexState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; rows: SearchRow[] };

const noop = () => () => {};

/** WinMX / Winny の検索結果ウィンドウ風の記事一覧。検索欄に入力すると全記事から絞り込む */
export function FileWindow({ title, rows, total, totalSize, pager }: Props) {
  // JS が動くまで検索欄は使えないので disabled にしておく
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<IndexState>({ status: "idle" });
  const requested = useRef(false);

  // 検索用の一覧は、検索欄を初めて使うときに 1 回だけ取得する
  function loadIndex() {
    if (requested.current) return;
    requested.current = true;
    setIndex({ status: "loading" });
    fetch("/search.json")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<SearchRow[]>;
      })
      .then((rows) => setIndex({ status: "ready", rows }))
      .catch(() => {
        requested.current = false;
        setIndex({ status: "error" });
      });
  }

  const terms = useMemo(() => normalizeForSearch(query).split(/\s+/).filter(Boolean), [query]);
  const searching = terms.length > 0;
  const results = useMemo(() => {
    if (!searching || index.status !== "ready") return [];
    return index.rows.filter((row) => {
      const haystack = normalizeForSearch(`${row.name} ${row.keywords}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [index, searching, terms]);

  let heading = title;
  let status = `${total} 個のオブジェクト`;
  let emptyText = "該当するファイルはありません。";
  if (searching) {
    if (index.status === "ready") {
      heading = `検索結果: "${query.trim()}" - ${results.length} 件`;
      status = `${results.length} 個のオブジェクトが見つかりました`;
    } else if (index.status === "error") {
      status = "一覧を読み込めませんでした。もう一度入力してください";
      emptyText = "一覧を読み込めませんでした。";
    } else {
      status = "読み込み中…";
      emptyText = "読み込み中…";
    }
  }

  return (
    <section className={styles.window} aria-labelledby="file-window-title">
      <div className={styles.titlebar}>
        <span className={styles.icon} aria-hidden="true" />
        <h1 id="file-window-title" className={styles.title}>
          {heading}
        </h1>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>

      <form role="search" className={styles.search} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="file-search" className={styles.label}>
          検索:
        </label>
        <input
          id="file-search"
          type="search"
          className={styles.field}
          placeholder="キーワード（タイトル・説明・タグ）"
          autoComplete="off"
          disabled={!hydrated}
          value={query}
          onFocus={loadIndex}
          onChange={(e) => {
            setQuery(e.target.value);
            if (index.status === "error") loadIndex();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
        />
      </form>

      {searching ? (
        <FileTable rows={results} empty={emptyText} />
      ) : (
        <FileTable rows={rows} empty="ファイルはまだありません。" />
      )}

      <p className={styles.status} aria-live="polite">
        <span className={index.status === "error" && searching ? styles.statusError : undefined}>{status}</span>
        {!searching && <span>合計 {totalSize}</span>}
      </p>

      {!searching && pager.totalPages > 1 && (
        <nav aria-label="ページ送り" className={styles.pager}>
          {pager.prevHref ? (
            <Link href={pager.prevHref} rel="prev" className={styles.button}>
              &lt; 前の {pager.perPage} 件
            </Link>
          ) : (
            <span className={`${styles.button} ${styles.disabled}`} aria-hidden="true">
              &lt; 前の {pager.perPage} 件
            </span>
          )}
          <span className={styles.pageInfo}>
            {pager.currentPage} / {pager.totalPages} ページ
          </span>
          {pager.nextHref ? (
            <Link href={pager.nextHref} rel="next" className={styles.button}>
              次の {pager.perPage} 件 &gt;
            </Link>
          ) : (
            <span className={`${styles.button} ${styles.disabled}`} aria-hidden="true">
              次の {pager.perPage} 件 &gt;
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
