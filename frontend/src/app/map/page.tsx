"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getPolicyDeserts, type PolicyDesertsResponse } from "@/lib/api/policy";
import { CitationTable } from "@/components/citations/CitationTable";
import { DISCLAIMER_POLICY } from "@/lib/disclaimers";

const IndiaMap = dynamic(
  () => import("@/components/map/IndiaMap").then((m) => m.IndiaMap),
  { ssr: false, loading: () => <div className="h-[520px] rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30" /> },
);

export default function MapPage() {
  const [specialty, setSpecialty] = useState("emergency");
  const [level, setLevel] = useState<"pin" | "state">("state");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deserts, setDeserts] = useState<PolicyDesertsResponse | null>(null);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const r = await getPolicyDeserts({ specialty, level });
      setDeserts(r);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load deserts");
    } finally {
      setBusy(false);
    }
  }

  const story = useMemo(() => {
    const ds = deserts?.desert_states?.length || 0;
    const dp = deserts?.desert_pins?.length || 0;
    return `This view turns policy output into a social-impact story: where coverage gaps concentrate (states: ${ds}, PINs: ${dp}).`;
  }, [deserts]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Policy safety framing</div>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
          {deserts?.safety_framing || DISCLAIMER_POLICY}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold">Desert overlay</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{story}</div>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {busy ? "Loading…" : "Load overlay"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Specialty
            </label>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
              placeholder="emergency"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Level
            </label>
            <div className="mt-2 flex gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={level === "state"}
                  onChange={() => setLevel("state")}
                />
                state
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={level === "pin"}
                  onChange={() => setLevel("pin")}
                />
                pin
              </label>
            </div>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            correlation_id:{" "}
            <span className="font-mono">{deserts?.correlation_id || "—"}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
            <div className="font-semibold">Error</div>
            <div className="mt-1">{error}</div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <IndiaMap deserts={deserts} />
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Legend</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
              <li>Amber circles: desert states (centroid approximations)</li>
              <li>
                If the backend doesn’t return lat/lon, we intentionally show a
                “story-first” overlay and keep a limitations note.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Desert lists</div>
            <div className="mt-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                States
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                {(deserts?.desert_states || []).length > 0 ? (
                  deserts?.desert_states?.slice(0, 40).map((s) => <li key={s}>{s}</li>)
                ) : (
                  <li className="text-zinc-500 dark:text-zinc-400">None returned.</li>
                )}
              </ul>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                PINs
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(deserts?.desert_pins || []).slice(0, 40).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Citations</div>
            <div className="mt-2">
              <CitationTable citations={deserts?.citations as any} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

