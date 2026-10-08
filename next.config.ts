import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 記事はすべてビルド時に静的生成する。Cache Components は使わない
  // （有効にすると dynamicParams = false などの静的生成向け設定が使えないため）
  images: {
    // Cloudflare Images のバインディングを設定するまでは最適化を行わない
    unoptimized: true,
  },
};

export default withContentCollections(nextConfig);

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
