import type { Metadata } from "next";
import { DotGothic16 } from "next/font/google";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Menu } from "@/components/Menu/Menu";
import { siteConfig } from "@/config/site";
import { alternates } from "@/lib/metadata";
import styles from "./layout.module.scss";
import "./globals.scss";

// 日本語フォントはサブセット指定ができないため preload しない
const dotFont = DotGothic16({ weight: "400", preload: false, variable: "--font-dot" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: alternates(),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={dotFont.variable}>
      <body id="top">
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <div className={styles.page}>
          <Header />
          <div className={styles.frame}>
            <Menu />
            <main id="main" className={styles.main}>
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
