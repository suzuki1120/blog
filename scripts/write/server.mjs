// 記事をブラウザから書くためのローカル専用サーバー（npm run write）。
// 127.0.0.1 にだけ待ち受け、content/posts/*.mdx の読み書きと git の commit / push を行う。
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  isValidSlug,
  listPosts,
  loadTaxonomy,
  postExists,
  readPost,
  todayJST,
  validate,
  writePost,
} from "./posts.mjs";

const PORT = Number(process.env.WRITE_PORT ?? 3300);
const DEV_URL = process.env.BLOG_DEV_URL?.replace(/\/$/, "");
const repoRoot = new URL("../../", import.meta.url).pathname;
const pageFile = new URL("./index.html", import.meta.url);
const run = promisify(execFile);

const taxonomy = await loadTaxonomy();

/** このブログの dev サーバーかどうかを、search.json（このブログ固有の URL）が JSON を返すかで見分ける */
async function isBlogDevServer(url) {
  try {
    const res = await fetch(`${url}/search.json`, { signal: AbortSignal.timeout(1500) });
    return res.ok && (res.headers.get("content-type") ?? "").includes("json");
  } catch {
    return false;
  }
}

/** dev サーバーの URL。BLOG_DEV_URL が無ければ 3000〜3009 番を探す（next dev は 3000 が使用中だと次の番号に移るため） */
async function findDevUrl() {
  if (DEV_URL) return { url: DEV_URL, running: await isBlogDevServer(DEV_URL) };
  const candidates = Array.from({ length: 10 }, (_, i) => `http://localhost:${3000 + i}`);
  const results = await Promise.all(candidates.map(isBlogDevServer));
  const index = results.indexOf(true);
  return index >= 0 ? { url: candidates[index], running: true } : { url: candidates[0], running: false };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function git(...args) {
  const { stdout } = await run("git", args, { cwd: repoRoot });
  return stdout.trimEnd();
}

async function gitStatus() {
  const branch = await git("rev-parse", "--abbrev-ref", "HEAD");
  const porcelain = await git("status", "--porcelain", "--", "content/posts");
  const changes = porcelain
    .split("\n")
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2).trim() || "M", path: line.slice(3) }));
  let ahead = 0;
  let hasUpstream = true;
  try {
    ahead = Number(await git("rev-list", "--count", "@{u}..HEAD"));
  } catch {
    hasUpstream = false;
  }
  return { branch, changes, ahead, hasUpstream };
}

async function publish(message) {
  const text = (message ?? "").trim();
  if (!text) throw new HttpError(400, "コミットメッセージを入力してください。");
  const { changes } = await gitStatus();
  const log = [];
  if (changes.length > 0) {
    await git("add", "--", "content/posts");
    log.push(await git("commit", "-m", text, "--", "content/posts"));
  } else {
    log.push("記事の変更はないため、コミットは作りませんでした。");
  }
  log.push(await git("push"));
  return { log: log.join("\n"), ...(await gitStatus()) };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 5_000_000) reject(new HttpError(413, "本文が大きすぎます。"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new HttpError(400, "JSON として読み取れません。"));
      }
    });
    req.on("error", reject);
  });
}

function savePost(slug, payload, { create }) {
  if (!isValidSlug(slug)) throw new HttpError(400, "slug は英小文字・数字・ハイフンだけで指定してください。");
  if (create && postExists(slug)) throw new HttpError(409, `「${slug}」は既に存在します。別の slug にしてください。`);
  if (!create && !postExists(slug)) throw new HttpError(404, `「${slug}」は見つかりません。`);
  const frontmatter = {
    title: String(payload.frontmatter?.title ?? "").trim(),
    description: String(payload.frontmatter?.description ?? "").trim(),
    date: String(payload.frontmatter?.date ?? "").trim(),
    updated: String(payload.frontmatter?.updated ?? "").trim() || undefined,
    category: String(payload.frontmatter?.category ?? ""),
    tags: Array.isArray(payload.frontmatter?.tags) ? payload.frontmatter.tags.map(String) : [],
    series: String(payload.frontmatter?.series ?? "").trim() || undefined,
    draft: Boolean(payload.frontmatter?.draft),
    ogImage: String(payload.frontmatter?.ogImage ?? "").trim() || undefined,
  };
  const errors = validate(frontmatter, taxonomy);
  if (errors.length > 0) throw new HttpError(422, errors.join("\n"));
  const extra = create ? [] : (readPost(slug)?.extra ?? []);
  writePost(slug, { frontmatter, extra, body: String(payload.body ?? "") });
  return readPost(slug);
}

async function route(req, url) {
  const { method } = req;
  const path = url.pathname;

  if (method === "GET" && path === "/") {
    return { html: readFileSync(pageFile, "utf8") };
  }
  if (method === "GET" && path === "/api/meta") {
    const [dev, git] = await Promise.all([findDevUrl(), gitStatus()]);
    return { taxonomy, devUrl: dev.url, devRunning: dev.running, today: todayJST(), git };
  }
  if (method === "GET" && path === "/api/posts") {
    return { posts: listPosts() };
  }
  if (method === "POST" && path === "/api/posts") {
    const payload = await readJson(req);
    return savePost(String(payload.slug ?? ""), payload, { create: true });
  }
  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch) {
    const slug = decodeURIComponent(postMatch[1]);
    if (method === "GET") {
      const post = isValidSlug(slug) ? readPost(slug) : null;
      if (!post) throw new HttpError(404, `「${slug}」は見つかりません。`);
      return post;
    }
    if (method === "PUT") {
      return savePost(slug, await readJson(req), { create: false });
    }
  }
  if (method === "GET" && path === "/api/git") {
    return gitStatus();
  }
  if (method === "POST" && path === "/api/publish") {
    const payload = await readJson(req);
    return publish(payload.message);
  }
  throw new HttpError(404, "Not found");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    const result = await route(req, url);
    if (result && typeof result.html === "string") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(result.html);
      return;
    }
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    // git などの外部コマンドの失敗は stderr を含めて返す
    const message = [error.message, error.stderr].filter(Boolean).join("\n").trim();
    if (status === 500) console.error(error);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: message }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`記事エディタ: http://localhost:${PORT}/`);
  console.log("別ターミナルで npm run dev を起動しておくと、保存した記事をその場でプレビューできます。");
});
