// siteConfig.name から ASCII アートのロゴを作り、src/components/Header/logoArt.ts に書き出す。
// predev / prebuild で毎回実行されるので、サイト名を変えるとロゴも作り直される。
import { readFileSync, writeFileSync } from "node:fs";
import figlet from "figlet";

const FONT = "Standard";
const outFile = new URL("../src/components/Header/logoArt.ts", import.meta.url);

// ビルド環境の Node が TypeScript を直接読めなくても動くよう、site.ts から name の値だけを取り出す
const siteSource = readFileSync(new URL("../src/config/site.ts", import.meta.url), "utf8");
const name = siteSource.match(/^\s*name:\s*"([^"]*)"/m)?.[1];
if (!name) {
  console.error('generate-logo: src/config/site.ts から name: "..." を読み取れませんでした。');
  process.exit(1);
}
// figlet のフォントは ASCII の文字しか持たない
if (!/^[\x20-\x7e]+$/.test(name)) {
  console.error(`generate-logo: サイト名「${name}」に ASCII 以外の文字が含まれているため、ロゴを作れません。`);
  console.error("src/config/site.ts の name を英数字にするか、src/components/Header/logoArt.ts を手で書いてください。");
  process.exit(1);
}

const lines = figlet
  .textSync(name, { font: FONT })
  .split("\n")
  .map((line) => line.trimEnd())
  .filter((line) => line.length > 0);
const art = lines.join("\n");
const columns = Math.max(...lines.map((line) => line.length));

const source = `// scripts/generate-logo.mjs が自動生成するファイル（手で編集しない）
// figlet（${FONT} フォント）で siteConfig.name「${name}」を描いたもの
export const logoArt = ${JSON.stringify(art)};
export const logoColumns = ${columns};
`;

let current = "";
try {
  current = readFileSync(outFile, "utf8");
} catch {}
if (current !== source) {
  writeFileSync(outFile, source);
  console.log(`generate-logo: ロゴを更新しました（${name}, ${columns} 文字幅）`);
}
