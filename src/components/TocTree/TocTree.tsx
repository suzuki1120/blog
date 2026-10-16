import type { Post } from "@/lib/posts";
import styles from "./TocTree.module.scss";

type Heading = Post["headings"][number];
type Node = Heading & { children: Heading[] };

// h3 は直前の h2 の下に入れる。h2 より前にある h3 は一番上の階層に置く
function toTree(headings: Heading[]): Node[] {
  const nodes: Node[] = [];
  for (const heading of headings) {
    const parent = nodes.at(-1);
    if (heading.depth === 3 && parent?.depth === 2) parent.children.push(heading);
    else nodes.push({ ...heading, children: [] });
  }
  return nodes;
}

/** エクスプローラーのツリー表示風の目次。見出しが 2 つ未満なら出さない */
export function TocTree({ headings, rootName }: { headings: Heading[]; rootName: string }) {
  if (headings.length < 2) return null;
  return (
    <nav className={styles.window} aria-labelledby="toc-title">
      <div className={styles.titlebar}>
        <span className={styles.titleIcon} aria-hidden="true" />
        <h2 id="toc-title" className={styles.title}>
          目次 - エクスプローラー
        </h2>
        <span className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <div className={styles.pane}>
        <p className={styles.root}>
          <span className={styles.fileIcon} aria-hidden="true" />
          {rootName}
        </p>
        <ol className={styles.tree}>
          {toTree(headings).map((node) => (
            <li key={node.id}>
              <span className={node.children.length > 0 ? styles.folderIcon : styles.fileIcon} aria-hidden="true" />
              <a href={`#${node.id}`}>{node.text}</a>
              {node.children.length > 0 && (
                <ol>
                  {node.children.map((child) => (
                    <li key={child.id}>
                      <span className={styles.fileIcon} aria-hidden="true" />
                      <a href={`#${child.id}`}>{child.text}</a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
