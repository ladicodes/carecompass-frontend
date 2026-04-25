"use client";

export function DegradedBanner({
  degradedComponents,
  warnings,
  title = "System status",
}: {
  degradedComponents?: string[];
  warnings?: string[];
  title?: string;
}) {
  const d = (degradedComponents || []).filter(Boolean);
  const w = (warnings || []).filter(Boolean);
  if (d.length === 0 && w.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold">{title}: degraded</div>
          <div className="mt-1 text-sm">
            Non-blocking warning. You can still try requests; some tools may be
            down or slow.
          </div>
        </div>
      </div>

      {d.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
            Degraded components
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {d.map((c) => (
              <span
                key={c}
                className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-900/40 dark:text-amber-100"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {w.length > 0 ? (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
            Warnings
          </div>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {w.map((x, idx) => (
              <li key={`${idx}-${x}`}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

