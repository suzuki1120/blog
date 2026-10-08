import type { Metadata } from "next";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { alternates } from "@/lib/metadata";
import { fileWindowProps } from "@/lib/files";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  alternates: alternates("/"),
};

export default function Home() {
  return <FileWindow {...fileWindowProps(getAllPosts(), 1, "/")!} />;
}
