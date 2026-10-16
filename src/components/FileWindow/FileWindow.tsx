"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WinDialog } from "@/components/WinDialog/WinDialog";
import { normalizeForSearch, type FileRow, type SearchRow } from "@/lib/file-row";
import { createLocalStore } from "@/lib/local-store";
import { FileIcons } from "./FileIcons";
import { FileTable, type Sort, type SortKey } from "./FileTable";
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

type View = "details" | "list" | "icons";

const views: { key: View; label: string }[] = [
  { key: "details", label: "詳細" },
  { key: "list", label: "一覧" },
  { key: "icons", label: "アイコン" },
];

// 表示形式と、1 文字のショートカットを使うかどうかは閲覧者ごとに保存する
const viewStore = createLocalStore<View>("blog:view", "details", (v) =>
  v === "list" || v === "icons" ? v : "details",
);
const shortcutStore = createLocalStore("blog:shortcuts", true, (v) => v !== false);

const noop = () => () => {};

// 一覧の元の並び（日付の新しい順）を初期状態とする
const defaultSort: Sort = { key: "date", dir: "desc" };

function sortRows<T extends FileRow>(rows: T[], sort: Sort): T[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => {
      const x = a.row;
      const y = b.row;
      const diff =
        sort.key === "size"
          ? x.bytes - y.bytes
          : sort.key === "name"
            ? x.name.localeCompare(y.name, "ja")
            : x[sort.key] < y[sort.key]
              ? -1
              : x[sort.key] > y[sort.key]
                ? 1
                : 0;
      // 同じ値のときは元の順番を保つ
      return diff * sign || a.i - b.i;
    })
    .map(({ row }) => row);
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** WinMX / Winny の検索結果ウィンドウ風の記事一覧。検索欄に入力すると全記事から絞り込む */
export function FileWindow({ title, rows, total, totalSize, pager }: Props) {
  // JS が動くまで検索欄・並べ替え・表示切り替えは使えないので disabled にしておく
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const view = viewStore.useValue();
  const shortcuts = shortcutStore.useValue();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<IndexState>({ status: "idle" });
  const [sort, setSort] = useState<Sort>(defaultSort);
  const [helpOpen, setHelpOpen] = useState(false);
  const requested = useRef(false);
  const windowRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  // 同じ列なら昇順・降順を切り替え、別の列なら昇順から始める
  function changeSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
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

  // キーボード操作。1 文字のキーはヘルプから無効にできる（入力中・他のダイアログ表示中は反応しない）
  useEffect(() => {
    function moveFocus(step: 1 | -1) {
      const links = [...(windowRef.current?.querySelectorAll<HTMLElement>("[data-file-link]") ?? [])];
      if (links.length === 0) return;
      const current = links.indexOf(document.activeElement as HTMLElement);
      const next = current === -1 ? (step === 1 ? 0 : links.length - 1) : current + step;
      links[Math.min(Math.max(next, 0), links.length - 1)].focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      // 一覧の中にフォーカスがあるときは矢印キーでも移動できる
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target instanceof HTMLElement && e.target.matches("[data-file-link]")) {
        e.preventDefault();
        moveFocus(e.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (!shortcuts || isTyping(e.target) || document.querySelector("dialog[open]")) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        moveFocus(e.key === "j" ? 1 : -1);
      } else if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);

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

  const shown = sortRows(searching ? results : rows, sort);
  const empty = searching ? emptyText : "ファイルはまだありません。";
  // JS が動く前は、サーバーで描いた詳細表示のままにする
  const currentView = hydrated ? view : "details";

  return (
    <section
      ref={windowRef}
      className={`${styles.window} ${index.status === "loading" ? styles.busy : ""}`}
      aria-labelledby="file-window-title"
      aria-busy={index.status === "loading"}
    >
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
          ref={searchRef}
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

      <div className={styles.toolbar}>
        <div role="group" aria-label="表示形式" className={styles.viewButtons}>
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              className={styles.toolButton}
              aria-pressed={currentView === v.key}
              disabled={!hydrated}
              onClick={() => viewStore.write(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.toolButton} disabled={!hydrated} onClick={() => setHelpOpen(true)}>
          ヘルプ(H)
        </button>
      </div>

      {currentView === "details" ? (
        <FileTable rows={shown} empty={empty} sort={sort} onSort={hydrated ? changeSort : undefined} />
      ) : (
        <FileIcons rows={shown} mode={currentView} empty={empty} />
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

      <WinDialog open={helpOpen} onClose={() => setHelpOpen(false)} title="ヘルプ - キーボード操作">
        <dl className={styles.keys}>
          <div>
            <dt>
              <kbd>/</kbd>
            </dt>
            <dd>検索欄へ移動</dd>
          </div>
          <div>
            <dt>
              <kbd>j</kbd> / <kbd>k</kbd>
            </dt>
            <dd>次 / 前のファイルを選ぶ</dd>
          </div>
          <div>
            <dt>
              <kbd>↓</kbd> / <kbd>↑</kbd>
            </dt>
            <dd>ファイルを選んでいるときに、次 / 前へ移動</dd>
          </div>
          <div>
            <dt>
              <kbd>Enter</kbd>
            </dt>
            <dd>選んだファイルを開く</dd>
          </div>
          <div>
            <dt>
              <kbd>Esc</kbd>
            </dt>
            <dd>検索語を消す（検索欄で）／このヘルプを閉じる</dd>
          </div>
          <div>
            <dt>
              <kbd>?</kbd>
            </dt>
            <dd>このヘルプを開く</dd>
          </div>
        </dl>
        <label className={styles.check}>
          <input type="checkbox" checked={shortcuts} onChange={(e) => shortcutStore.write(e.target.checked)} />
          1 文字のキー（/ j k ?）で操作する
        </label>
        <p className={styles.dialogActions}>
          <button type="button" className={styles.button} onClick={() => setHelpOpen(false)}>
            OK
          </button>
        </p>
      </WinDialog>
    </section>
  );
}
