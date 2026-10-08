import { siteConfig } from "@/config/site";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: siteConfig.description });
}
