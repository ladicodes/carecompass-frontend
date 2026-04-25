"use client";

export function JsonBlock({
  value,
  collapsed = false,
}: {
  value: unknown;
  collapsed?: boolean;
}) {
  const text = (() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  })();

  return (
    <pre
      className={[
        "rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100",
        collapsed ? "max-h-52 overflow-auto" : "overflow-auto",
      ].join(" ")}
    >
      {text}
    </pre>
  );
}

