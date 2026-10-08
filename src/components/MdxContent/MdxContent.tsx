import { MDXContent } from "@content-collections/mdx/react";
import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./MdxContent.module.scss";

// サイト内リンクは next/link、外部リンクは別タブで開く
function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  if (href.startsWith("#")) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

const components = { a: Anchor };

export function MdxContent({ code }: { code: string }) {
  return (
    <div className={styles.body}>
      <MDXContent code={code} components={components} />
    </div>
  );
}
