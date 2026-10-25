// 記事（content/posts/*.mdx）の読み書きと検証。
// frontmatter は content-collections.ts のスキーマに合わせた項目だけを扱う。
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const postsDir = new URL("../../content/posts/", import.meta.url).pathname;

const KNOWN_KEYS = ["title", "description", "date", "updated", "category", "tags", "series", "draft", "ogImage"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** src/config/taxonomy.ts からカテゴリとタグの定義を読む（Node 24 は TypeScript を直接読める） */
export async function loadTaxonomy() {
  const mod = await import("../../src/config/taxonomy.ts");
  return { categories: mod.categories, tags: mod.tags, series: mod.series ?? {} };
}

/** 日本時間の今日を YYYY-MM-DD で返す */
export function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function isValidSlug(slug) {
  return SLUG_RE.test(slug);
}

// ---- frontmatter の読み書き ----

function parseScalar(raw) {
  const value = raw.trim();
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

function parseList(raw) {
  const inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  return inner
    .split(",")
    .map((item) => parseScalar(item))
    .filter((item) => item !== "");
}

export function parsePost(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, extra: [], body: source };
  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};
  const extra = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) {
      if (line.trim() !== "") extra.push(line);
      continue;
    }
    const [, key, rawValue] = kv;
    if (!KNOWN_KEYS.includes(key)) {
      extra.push(line);
      continue;
    }
    if (key === "tags") {
      if (rawValue.trim() === "") {
        // ブロック形式（- a / - b）
        const items = [];
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
          items.push(parseScalar(lines[++i].replace(/^\s*-\s+/, "")));
        }
        frontmatter.tags = items;
      } else {
        frontmatter.tags = parseList(rawValue);
      }
    } else if (key === "draft") {
      frontmatter.draft = rawValue.trim() === "true";
    } else {
      frontmatter[key] = parseScalar(rawValue);
    }
  }
  return { frontmatter, extra, body: source.slice(match[0].length) };
}

function needsQuote(value) {
  return (
    value === "" ||
    /^[\s"'#&*!|>%@`{}\[\],?:-]/.test(value) ||
    /[:#]\s|\s$/.test(value) ||
    /^(true|false|null|~|yes|no|on|off)$/i.test(value) ||
    /^[\d.+-]+$/.test(value)
  );
}

function scalar(value) {
  const text = String(value);
  return needsQuote(text) ? JSON.stringify(text) : text;
}

export function serializePost({ frontmatter, extra = [], body }) {
  const lines = [];
  lines.push(`title: ${scalar(frontmatter.title)}`);
  lines.push(`description: ${scalar(frontmatter.description)}`);
  lines.push(`date: ${frontmatter.date}`);
  if (frontmatter.updated) lines.push(`updated: ${frontmatter.updated}`);
  lines.push(`category: ${frontmatter.category}`);
  lines.push(`tags: [${(frontmatter.tags ?? []).join(", ")}]`);
  if (frontmatter.series) lines.push(`series: ${frontmatter.series}`);
  if (frontmatter.draft) lines.push("draft: true");
  if (frontmatter.ogImage) lines.push(`ogImage: ${scalar(frontmatter.ogImage)}`);
  lines.push(...extra);
  const text = body.replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "");
  return `---\n${lines.join("\n")}\n---\n\n${text}\n`;
}

// ---- 検証 ----

export function validate(frontmatter, taxonomy) {
  const errors = [];
  if (!frontmatter.title?.trim()) errors.push("タイトルを入力してください。");
  if (!frontmatter.description?.trim()) errors.push("説明文を入力してください。");
  if (!DATE_RE.test(frontmatter.date ?? "")) errors.push("日付は YYYY-MM-DD 形式で指定してください。");
  if (frontmatter.updated && !DATE_RE.test(frontmatter.updated)) {
    errors.push("更新日は YYYY-MM-DD 形式で指定してください。");
  }
  if (!(frontmatter.category in taxonomy.categories)) {
    errors.push(`カテゴリ「${frontmatter.category ?? ""}」は src/config/taxonomy.ts に定義されていません。`);
  }
  for (const tag of frontmatter.tags ?? []) {
    if (!(tag in taxonomy.tags)) errors.push(`タグ「${tag}」は src/config/taxonomy.ts に定義されていません。`);
  }
  if (frontmatter.series && !(frontmatter.series in taxonomy.series)) {
    errors.push(`連載「${frontmatter.series}」は src/config/taxonomy.ts に定義されていません。`);
  }
  return errors;
}

// ---- ファイル操作 ----

function fileOf(slug) {
  if (!isValidSlug(slug)) throw new Error("slug は英小文字・数字・ハイフンだけで指定してください。");
  return join(postsDir, `${slug}.mdx`);
}

export function listPosts() {
  return readdirSync(postsDir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const slug = name.slice(0, -4);
      const { frontmatter } = parsePost(readFileSync(join(postsDir, name), "utf8"));
      return {
        slug,
        title: frontmatter.title ?? "(無題)",
        date: frontmatter.date ?? "",
        updated: frontmatter.updated,
        category: frontmatter.category ?? "",
        tags: frontmatter.tags ?? [],
        draft: Boolean(frontmatter.draft),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

export function postExists(slug) {
  return existsSync(fileOf(slug));
}

export function readPost(slug) {
  const file = fileOf(slug);
  if (!existsSync(file)) return null;
  return { slug, ...parsePost(readFileSync(file, "utf8")) };
}

export function writePost(slug, data) {
  writeFileSync(fileOf(slug), serializePost(data), "utf8");
}
