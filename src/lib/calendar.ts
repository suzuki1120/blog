export type CalendarDay = {
  day: number;
  /** その日に公開した記事のうち最初の 1 件の slug */
  slug?: string;
  /** その日に公開した記事のタイトル（複数ある場合は「、」区切り） */
  titles?: string;
};

export type CalendarMonth = {
  year: number;
  month: number;
  /** 日曜始まりの週ごとの配列。月の範囲外は null */
  weeks: (CalendarDay | null)[][];
};

/**
 * 指定した年月のカレンダーを作る。日付は "YYYY-MM-DD" の文字列で比較し、
 * 実行環境のタイムゾーンに影響されないよう曜日の計算は UTC で行う。
 */
export function buildCalendar(
  year: number,
  month: number,
  posts: readonly { slug: string; title: string; date: string }[],
): CalendarMonth {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const byDay = new Map<number, { slug: string; title: string }[]>();
  // posts は新しい順で渡されるため、古い順に並べ替えて「その日の最初の記事」を先頭にする
  for (const post of [...posts].reverse()) {
    if (!post.date.startsWith(prefix)) continue;
    const day = Number(post.date.slice(prefix.length));
    byDay.set(day, [...(byDay.get(day) ?? []), post]);
  }

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (CalendarDay | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    const entries = byDay.get(day);
    cells.push(
      entries
        ? { day, slug: entries[0].slug, titles: entries.map((e) => e.title).join("、") }
        : { day },
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { year, month, weeks };
}
