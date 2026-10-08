import { toSearchRow } from "@/lib/files";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

/** 一覧ウィンドウの検索欄が、初めて使われたときに読み込む全記事の一覧 */
export function GET() {
  return Response.json(getAllPosts().map(toSearchRow));
}
