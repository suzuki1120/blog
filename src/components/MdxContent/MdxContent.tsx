import { MDXContent } from "@content-collections/mdx/react";
import Link from "next/link";
import { Children, isValidElement, type ComponentProps } from "react";
import { CopyButton } from "@/components/CopyButton/CopyButton";
import { Download } from "@/components/Download/Download";
import { ImageViewer } from "@/components/ImageViewer/ImageViewer";
import { LinkCard } from "@/components/LinkCard/LinkCard";
import { MessageBox } from "@/components/MessageBox/MessageBox";
import styles from "./MdxContent.module.scss";

// サイト内リンクは next/link、外部リンクは別タブで開く
function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  if (href.startsWith("#")) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

// 見出しの後ろに、その見出しへのリンク（#）を付ける。id は rehype-slug が付ける
function headingWithAnchor(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props}>
        {children}
        {id && (
          <a href={`#${id}`} className={styles.anchor} aria-label="この見出しへのリンク">
            #
          </a>
        )}
      </Tag>
    );
  };
}

// シェルのコードは MS-DOS プロンプト、それ以外はメモ帳のウィンドウとして描く
const shellLanguages = new Set(["bash", "sh", "shell", "zsh", "console", "powershell", "bat", "cmd"]);

type ChildProps = { "data-rehype-pretty-code-title"?: string; "data-language"?: string; children?: unknown };

/** rehype-pretty-code が出力するコードブロック（figure）を Win98 のウィンドウにする */
function Figure(props: ComponentProps<"figure">) {
  if (!("data-rehype-pretty-code-figure" in props)) return <figure {...props} />;

  const children = Children.toArray(props.children);
  const elements = children.filter((child) => isValidElement<ChildProps>(child));
  // ファイル名（```ts title="..."）はタイトルバーに移すので、本体からは除く
  const caption = elements.find((child) => "data-rehype-pretty-code-title" in child.props);
  const body = children.filter((child) => child !== caption);
  const fileTitle = typeof caption?.props.children === "string" ? caption.props.children : undefined;
  const language = elements.find((child) => child.props["data-language"])?.props["data-language"] ?? "plaintext";

  const shell = shellLanguages.has(language);
  const ext = language === "plaintext" ? "txt" : language;
  const windowTitle = shell
    ? `MS-DOS プロンプト${fileTitle ? ` - ${fileTitle}` : ""}`
    : `${fileTitle ?? `無題.${ext}`} - メモ帳`;

  return (
    <figure {...props} className={styles.codeWindow} aria-label={windowTitle}>
      <div className={styles.codeTitlebar}>
        <span className={shell ? styles.dosIcon : styles.notepadIcon} aria-hidden="true" />
        <span className={styles.codeTitle}>{windowTitle}</span>
        <CopyButton label="コピー" className={styles.copy} />
      </div>
      {body}
    </figure>
  );
}

const components = {
  a: Anchor,
  h2: headingWithAnchor("h2"),
  h3: headingWithAnchor("h3"),
  figure: Figure,
  // 記事の中で <MessageBox> のように書いて使う部品
  MessageBox,
  LinkCard,
  ImageViewer,
  Download,
};

export function MdxContent({ code }: { code: string }) {
  return (
    <div className={styles.body}>
      <MDXContent code={code} components={components} />
    </div>
  );
}
