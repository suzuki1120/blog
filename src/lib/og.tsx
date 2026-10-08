import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

/**
 * 日本語フォント（Noto Sans JP）を Google Fonts から必要な文字だけ取得する。
 * OG 画像はビルド時に生成されるため、この通信もビルド時のみ発生する。
 */
async function loadFont(text: string): Promise<ArrayBuffer | undefined> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!fontUrl) return undefined;
    return await (await fetch(fontUrl)).arrayBuffer();
  } catch {
    return undefined;
  }
}

export async function renderOgImage({ title, subtitle }: { title: string; subtitle?: string }) {
  const font = await loadFont(`${title}${subtitle ?? ""}${siteConfig.name}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#15181d",
          color: "#e6e8eb",
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {subtitle && <div style={{ fontSize: 32, color: "#6aa8ff" }}>{subtitle}</div>}
          <div style={{ fontSize: title.length > 40 ? 52 : 64, fontWeight: 700, lineHeight: 1.35 }}>{title}</div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#9aa3ad" }}>{siteConfig.name}</div>
      </div>
    ),
    {
      ...ogSize,
      fonts: font ? [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
