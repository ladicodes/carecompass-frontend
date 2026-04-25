"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  triageAnalyze,
  triageMatchFacilities,
  type TriageMatchResponse,
  type TriageSessionResponse,
} from "@/lib/api/triage";
import { DegradedBanner } from "@/components/system/DegradedBanner";
import { CitationTable } from "@/components/citations/CitationTable";
import { JsonBlock } from "@/components/ui/JsonBlock";
import { Markdown } from "@/components/ui/Markdown";
import { DISCLAIMER_MATCH, DISCLAIMER_TRIAGE } from "@/lib/disclaimers";

const STORAGE_KEY = "carecompass_session_v1";

const EXAMPLE_QUERIES = [
  "Fever and difficulty breathing for 2 days; need emergency care near Patna",
  "Painless vision loss; need ophthalmology workup",
  "Recurring chest pain; need cardiology and imaging capacity",
  "Fracture after fall; need orthopedics and OR capability",
  "List facilities that look inconsistent on equipment vs procedure claims in Bihar",
];

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{children}</div>
    </div>
  );
}

export default function ChatPage() {
  const [symptomsText, setSymptomsText] = useState("");
  const [stateHint, setStateHint] = useState<string>("");
  const [topK, setTopK] = useState(10);

  const [busyAnalyze, setBusyAnalyze] = useState(false);
  const [busyMatch, setBusyMatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<TriageSessionResponse | null>(null);
  const [match, setMatch] = useState<TriageMatchResponse | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        symptomsText?: string;
        stateHint?: string;
        topK?: number;
        session?: TriageSessionResponse;
        match?: TriageMatchResponse;
      };
      if (parsed.symptomsText) setSymptomsText(parsed.symptomsText);
      if (parsed.stateHint) setStateHint(parsed.stateHint);
      if (typeof parsed.topK === "number") setTopK(parsed.topK);
      if (parsed.session) setSession(parsed.session);
      if (parsed.match) setMatch(parsed.match);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ symptomsText, stateHint, topK, session, match }),
      );
    } catch {
      // ignore
    }
  }, [symptomsText, stateHint, topK, session, match]);

  const correlationId = useMemo(
    () => match?.correlation_id || session?.correlation_id || "",
    [match?.correlation_id, session?.correlation_id],
  );

  async function onAnalyze() {
    setError(null);
    setBusyAnalyze(true);
    setMatch(null);
    try {
      const resp = await triageAnalyze({ symptoms_text: symptomsText, metadata: {} });
      setSession(resp);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Analyze failed";
      setError(msg);
    } finally {
      setBusyAnalyze(false);
    }
  }

  async function onMatch() {
    setError(null);
    if (!session?.session_id) {
      setError("No session_id yet. Run Analyze first.");
      return;
    }
    setBusyMatch(true);
    try {
      const resp = await triageMatchFacilities({
        session_id: session.session_id,
        top_k: topK,
        state_hint: stateHint ? stateHint : null,
      });
      setMatch(resp);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? `${e.message}${e.correlationId ? ` (correlation_id: ${e.correlationId})` : ""}`
          : "Match failed";
      setError(msg);
    } finally {
      setBusyMatch(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Example queries</div>
          <div className="mt-2 grid gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
                onClick={() => setSymptomsText(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Callout title="Triage safety disclaimer">{DISCLAIMER_TRIAGE}</Callout>

        {correlationId ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            <div className="font-semibold">Debug</div>
            <div className="mt-1">
              correlation_id: <span className="font-mono">{correlationId}</span>
            </div>
          </div>
        ) : null}
      </aside>

      <section className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-sm font-semibold">Symptom / situation input</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Capability matching only. The backend may take 5–20s if Databricks is cold.
              </div>
            </div>

            <textarea
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
              placeholder="Describe symptoms + location context (city/state) + urgency..."
            />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={onAnalyze}
                disabled={busyAnalyze || symptomsText.trim().length < 1}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {busyAnalyze ? "Analyzing…" : "Analyze capabilities"}
              </button>

              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                session:{" "}
                <span className="font-mono">{session?.session_id || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
            <div className="font-semibold">Error</div>
            <div className="mt-1">{error}</div>
          </div>
        ) : null}

        <DegradedBanner
          title="Triage"
          degradedComponents={session?.degraded_components}
          warnings={session?.warnings}
        />

        {session ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Capabilities needed</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(session.capabilities_needed || []).length > 0 ? (
                  session.capabilities_needed?.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">—</div>
                )}
              </div>

              <div className="mt-4 text-sm font-semibold">Red flags</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                {(session.red_flags || []).length > 0 ? (
                  session.red_flags?.map((x, idx) => <li key={`${idx}-${x}`}>{x}</li>)
                ) : (
                  <li className="text-zinc-500 dark:text-zinc-400">None returned.</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Graph summary</div>
              <div className="mt-2">
                <Markdown content={session.graph_summary} />
                {!session.graph_summary ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    No graph summary returned.
                  </div>
                ) : null}
              </div>
              <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                query_used: <span className="font-mono">{session.query_used || "—"}</span>
              </div>
            </div>
          </div>
        ) : null}

        {session ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-semibold">Find facilities</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Uses LangGraph match. Handles “HTTP 200 but error” responses.
                </div>
              </div>

              <button
                type="button"
                onClick={onMatch}
                disabled={busyMatch || busyAnalyze}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {busyMatch ? "Matching…" : "Match facilities"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  State hint (optional)
                </label>
                <input
                  value={stateHint}
                  onChange={(e) => setStateHint(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
                  placeholder="e.g. Bihar"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  top_k: {topK}
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>
          </div>
        ) : null}

        {match ? (
          <div className="space-y-4">
            <Callout title="Match safety disclaimer">
              {match.safety_disclaimer || DISCLAIMER_MATCH}
            </Callout>

            <DegradedBanner
              title="Match"
              degradedComponents={match.degraded_components}
              warnings={match.warnings}
            />

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Result (markdown)</div>
              <div className="mt-2">
                <Markdown content={match.graph_summary || match.final_answer} />
                {!match.graph_summary && !match.final_answer ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    No markdown returned (graph_summary/final_answer missing).
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold">Citations</div>
              <div className="mt-2">
                <CitationTable citations={match.citations} />
              </div>
            </div>

            <details className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <summary className="cursor-pointer text-sm font-semibold">
                Structured artifacts (when present)
              </summary>
              <div className="mt-3 grid gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                    extraction_result
                  </div>
                  <div className="mt-1">
                    <JsonBlock value={match.extraction_result ?? null} collapsed />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                    trust_artifacts
                  </div>
                  <div className="mt-1">
                    <JsonBlock value={match.trust_artifacts ?? null} collapsed />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                    synthesis_artifacts
                  </div>
                  <div className="mt-1">
                    <JsonBlock value={match.synthesis_artifacts ?? null} collapsed />
                  </div>
                </div>
              </div>
            </details>
          </div>
        ) : null}
      </section>
    </div>
  );
}

