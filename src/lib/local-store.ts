import { useSyncExternalStore } from "react";

/**
 * ブラウザの localStorage に、閲覧者ごとの設定（表示形式・閲覧履歴など）を保存する。
 * プライベートブラウズなどで使えないときは、ページを開いている間だけメモリに持つ。
 * サーバーでの描画と最初の描画では fallback を返す（ハイドレーションの不一致を防ぐ）
 */
export function createLocalStore<T>(key: string, fallback: T, parse: (value: unknown) => T) {
  const listeners = new Set<() => void>();
  let storageOk = true;
  let cachedRaw: string | null | undefined;
  let cached = fallback;

  function read(): T {
    if (!storageOk) return cached;
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return cached;
    }
    // useSyncExternalStore は同じ値を返し続ける必要があるため、文字列が変わったときだけ読み直す
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cached = raw === null ? fallback : parse(JSON.parse(raw));
      } catch {
        cached = fallback;
      }
    }
    return cached;
  }

  function write(value: T) {
    cached = value;
    try {
      cachedRaw = JSON.stringify(value);
      localStorage.setItem(key, cachedRaw);
    } catch {
      storageOk = false;
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    // 別のタブで変更されたときも反映する
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { useValue, read, write };
}
