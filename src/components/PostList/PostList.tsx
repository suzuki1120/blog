import type { Post } from "@/lib/posts";
import { PostCard } from "../PostCard/PostCard";
import styles from "./PostList.module.scss";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>記事はまだありません。</p>;
  }
  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
