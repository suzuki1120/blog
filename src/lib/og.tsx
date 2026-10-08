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
  paper: "#0b0b0b",
  panel: "#0f1a10",
  neon: "#5dfb5a",
  neonDim: "#3b8f35",
  ink2: "#a3a3a3",
  winFace: "#c0c0c0",
  winTitle: "#000080",
  winTitle2: "#1084d0",
  white: "#ffffff",
};

export async function renderOgImage({ title, subtitle }: { title: string; subtitle?: string }) {
  const brand = siteConfig.name;
  const label = subtitle ? `[${subtitle}]` : "";
  const font = await loadFont(`${title}${label}${brand}■`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          background: colors.paper,
          color: colors.neon,
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        {/* 緑の二重枠 */}
        <div style={{ flex: 1, display: "flex", padding: 6, border: `4px solid ${colors.neonDim}` }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              border: `2px solid ${colors.neonDim}`,
              background: colors.panel,
            }}
          >
            {/* Win98 風のタイトルバー */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "8px 20px",
                background: `linear-gradient(90deg, ${colors.winTitle}, ${colors.winTitle2})`,
                color: colors.white,
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              <div style={{ width: 28, height: 22, background: "#f5e663", border: "2px solid #000" }} />
              {brand}
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 20,
                padding: "0 48px",
              }}
            >
              {label && <div style={{ fontSize: 30, color: colors.ink2 }}>{label}</div>}
              <div
                style={{
                  fontSize: title.length > 40 ? 50 : 60,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  textShadow: `0 0 16px ${colors.neonDim}`,
                }}
              >
                {`■ ${title}`}
              </div>
            </div>
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
