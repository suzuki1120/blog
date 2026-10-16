import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

/** リンク集で配る 88×31 のバナー。ビルド時に 1 回だけ生成する */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 5px",
          background: "#0b0b0b",
          border: "1px solid #3b8f35",
        }}
      >
        {/* 黄色いフォルダ */}
        <div style={{ width: 16, height: 12, background: "#f5e663", border: "1px solid #000", borderTop: "3px solid #000" }} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <div style={{ color: "#5dfb5a", fontSize: 14, fontWeight: 700 }}>{siteConfig.name}</div>
          <div style={{ color: "#a3a3a3", fontSize: 7, marginTop: 2 }}>TECH BLOG</div>
        </div>
      </div>
    ),
    { width: 88, height: 31 },
  );
}
