"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./CopyButton.module.scss";

type Props = {
  /** コピーする文字列。省略すると、ボタンを含む figure 内のコードをコピーする */
  text?: string;
  label: string;
  className?: string;
};

type Status = "idle" | "done" | "error";

const noop = () => () => {};

// Clipboard API が使えない・許可されない環境向けに、選択してコピーする古い方法で試す
function copyWithSelection(value: string, button: HTMLButtonElement): boolean {
  const area = document.createElement("textarea");
  area.value = value;
  area.readOnly = true;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  button.focus();
  return ok;
}

/** Win98 のボタン風のコピーボタン。結果はボタンの文字と読み上げで知らせる */
export function CopyButton({ text, label, className }: Props) {
  // JS が動くまでは押しても何も起きないので disabled にしておく
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(button: HTMLButtonElement) {
    // rehype-pretty-code は空行に半角空白を 1 つ入れるので、コードのときは取り除く
    const value =
      text ?? (button.closest("figure")?.querySelector("pre code")?.textContent ?? "").replace(/^ $/gm, "");
    try {
      await navigator.clipboard.writeText(value);
      setStatus("done");
    } catch {
      setStatus(copyWithSelection(value, button) ? "done" : "error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const message = status === "done" ? "コピーしました" : status === "error" ? "コピーできませんでした" : "";

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${className ?? ""}`}
        disabled={!hydrated}
        onClick={(e) => copy(e.currentTarget)}
      >
        {message || label}
      </button>
      <span className="visually-hidden" role="status">
        {message}
      </span>
    </>
  );
}
