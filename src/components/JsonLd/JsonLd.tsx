/**
 * 構造化データ（JSON-LD）。記事のタイトルなどに "</script>" が含まれても
 * タグが閉じないよう、"<" を < に置き換えて出力する
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
