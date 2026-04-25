"use client";

import type { CitationRecord } from "@/lib/api/triage";

function formatConfidence(x?: number) {
  if (typeof x !== "number" || Number.isNaN(x)) return "—";
  return `${Math.round(x * 100)}%`;
}

export function CitationTable({ citations }: { citations?: CitationRecord[] }) {
  const rows = (citations || []).filter(Boolean);
  if (rows.length === 0) {
    return (
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        No citations returned.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Facility</th>
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">Evidence</th>
              <th className="px-3 py-2">Confidence</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-950">
            {rows.map((c, idx) => (
              <tr
                key={`${idx}-${c.source || "src"}`}
                className="border-t border-zinc-200 align-top dark:border-zinc-800"
              >
                <td className="px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                  {c.source || "—"}
                </td>
                <td className="px-3 py-2">{c.facility || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                  {c.field || "—"}
                </td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                  <div className="max-w-[72ch] whitespace-pre-wrap">
                    {c.evidence_snippet || "—"}
                  </div>
                  {c.row_id ? (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      row: <span className="font-mono">{c.row_id}</span>
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2">{formatConfidence(c.confidence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

