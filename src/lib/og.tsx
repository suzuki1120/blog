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

// OG 画像の描画（Satori）は OKLCH に対応していないため、globals.scss のトークンに近い値を 16 進で持つ
const colors = {
  paper: "#e3f1f8",
  check: "rgba(178, 216, 235, 0.5)",
  box: "#fffdf9",
  rule: "#b4d0dd",
  pink: "#d64f86",
  ink: "#4a3a36",
  ink2: "#7a6a66",
};

export async function renderOgImage({ title, subtitle }: { title: string; subtitle?: string }) {
  const brand = `☆ ${siteConfig.name} ☆`;
  const font = await loadFont(`${title}${subtitle ?? ""}${brand}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 56,
          backgroundColor: colors.paper,
          backgroundImage: `repeating-linear-gradient(0deg, ${colors.check} 0px, ${colors.check} 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, ${colors.check} 0px, ${colors.check} 24px, transparent 24px, transparent 48px)`,
          color: colors.ink,
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `3px solid ${colors.rule}`,
            borderRadius: 8,
            background: colors.box,
            boxShadow: `8px 8px 0 ${colors.rule}`,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "10px 32px",
              background: colors.pink,
              color: colors.box,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {brand}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, padding: "0 48px" }}>
            {subtitle && <div style={{ fontSize: 30, color: colors.ink2 }}>{subtitle}</div>}
            <div style={{ fontSize: title.length > 40 ? 50 : 60, fontWeight: 700, lineHeight: 1.4 }}>{title}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: font ? [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
