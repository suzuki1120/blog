// クライアント部品からも読み込む型と関数。記事本体（content-collections）を読み込まないよう、ここには import を置かない

/** 一覧ウィンドウの 1 行。表示に必要な値だけをサーバー側で計算しておく */
export type FileRow = {
  slug: string;
  name: string;
  size: string;
  hash: string;
  date: string;
  isNew: boolean;
  draft: boolean;
};

/** 検索用。行の情報に、検索対象の文字列を足したもの */
export type SearchRow = FileRow & { keywords: string };

/** 2026-10-08 → 2026/10/08 */
export function formatSlashDate(date: string): string {
  return date.replaceAll("-", "/");
}

/** 検索語と対象文字列をそろえる（全角半角・大文字小文字の違いを無視） */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}
