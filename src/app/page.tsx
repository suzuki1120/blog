import type { Metadata } from "next";
import { ListPage } from "@/components/ListPage/ListPage";
import { alternates } from "@/lib/metadata";
import { getAllPosts, paginate } from "@/lib/posts";

export const metadata: Metadata = {
  alternates: alternates("/"),
};

export default function Home() {
  const page = paginate(getAllPosts(), 1)!;
  return <ListPage page={page} basePath="/" />;
}
