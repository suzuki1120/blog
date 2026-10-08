import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileWindow } from "@/components/FileWindow/FileWindow";
import { alternates } from "@/lib/metadata";
import { fileWindowProps } from "@/lib/files";
import { getAllPosts, getPageParams, parsePageParam } from "@/lib/posts";

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPageParams(getAllPosts().length);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `記事一覧（${page}ページ目）`,
    alternates: alternates(`/page/${page}`),
  };
}

export default async function Page({ params }: Props) {
  const page = parsePageParam((await params).page) ?? NaN;
  const props = fileWindowProps(getAllPosts(), page, "/");
  if (!props || page === 1) notFound();
  return <FileWindow {...props} />;
}
