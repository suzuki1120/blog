import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/ListPage/ListPage";
import { alternates } from "@/lib/metadata";
import { getAllPosts, getPageParams, paginate, parsePageParam } from "@/lib/posts";

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
  const page = paginate(getAllPosts(), parsePageParam((await params).page) ?? NaN);
  if (!page || page.currentPage === 1) notFound();
  return <ListPage title="記事一覧" lead={`${page.currentPage} / ${page.totalPages} ページ`} page={page} basePath="/" />;
}
