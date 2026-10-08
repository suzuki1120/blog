import Link from "next/link";
import { categories, tags } from "@/config/taxonomy";
import { fileHash, fileName, formatSize, formatSlashDate } from "@/lib/files";
import type { Post } from "@/lib/posts";
import styles from "./FileInfo.module.scss";

/** Win98 のプロパティダイアログ風のファイル情報 */
export function FileInfo({ post }: { post: Post }) {
  const name = fileName(post);
  return (
    <section className={styles.window} aria-labelledby="file-info-title">
      <div className={styles.titlebar}>
        <h2 id="file-info-title" className={styles.title}>
          {name} のプロパティ
        </h2>
        <span className={styles.controls} aria-hidden="true">
          <span>?</span>
          <span>×</span>
        </span>
      </div>
      <dl className={styles.props}>
        <div>
          <dt>名前</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>種類</dt>
          <dd>
            <Link href={`/categories/${post.category}`}>{categories[post.category]}</Link>
          </dd>
        </div>
        <div>
          <dt>サイズ</dt>
          <dd>
            {formatSize(post.byteSize)}（{post.byteSize.toLocaleString("ja-JP")} バイト）
          </dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd className={styles.mono}>{fileHash(post.slug)}</dd>
        </div>
        <div>
          <dt>作成日時</dt>
          <dd>
            <time dateTime={post.date}>{formatSlashDate(post.date)}</time>
          </dd>
        </div>
        {post.updated && (
          <div>
            <dt>更新日時</dt>
            <dd>
              <time dateTime={post.updated}>{formatSlashDate(post.updated)}</time>
            </dd>
          </div>
        )}
        {post.tags.length > 0 && (
          <div>
            <dt>タグ</dt>
            <dd>
              {post.tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && ", "}
                  <Link href={`/tags/${tag}`}>{tags[tag]}</Link>
                </span>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt>読了目安</dt>
          <dd>約 {post.readingMinutes} 分</dd>
        </div>
      </dl>
    </section>
  );
}
