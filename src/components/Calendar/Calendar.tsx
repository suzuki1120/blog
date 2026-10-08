import Link from "next/link";
import { buildCalendar } from "@/lib/calendar";
import type { Post } from "@/lib/posts";
import styles from "./Calendar.module.scss";

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

/** 最新記事の月のカレンダー。記事を公開した日はその記事へのリンクになる */
export function Calendar({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  const [year, month] = posts[0].date.split("-").map(Number);
  const calendar = buildCalendar(year, month, posts);

  return (
    <table className={styles.calendar}>
      <caption className={styles.caption}>
        {calendar.year}年{calendar.month}月
      </caption>
      <thead>
        <tr>
          {weekdays.map((w, i) => (
            <th key={w} scope="col" className={i === 0 ? styles.sun : i === 6 ? styles.sat : undefined}>
              {w}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calendar.weeks.map((week, i) => (
          <tr key={i}>
            {week.map((cell, j) =>
              cell === null ? (
                <td key={j} />
              ) : (
                <td key={j} className={j === 0 ? styles.sun : j === 6 ? styles.sat : undefined}>
                  {cell.slug ? (
                    <Link href={`/posts/${cell.slug}`} title={cell.titles} className={styles.posted}>
                      {cell.day}
                    </Link>
                  ) : (
                    cell.day
                  )}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
