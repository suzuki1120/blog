import type { Metadata } from "next";
import { UserInfo } from "@/components/UserInfo/UserInfo";
import { siteConfig } from "@/config/site";
import { alternates } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "プロフィール",
  description: `${siteConfig.name} を書いている ${siteConfig.author} のプロフィールです。`,
  alternates: alternates("/about"),
};

export default function AboutPage() {
  return <UserInfo />;
}
