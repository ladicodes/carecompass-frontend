"use client";

import { useEffect, useMemo, useState } from "react";
import { healthz, readiness } from "@/lib/api/system";
import {
  isDemoModeEnabled,
  onDemoModeChange,
  setDemoModeEnabled,
} from "@/lib/demo/mode";

type Status = "unknown" | "ok" | "degraded" | "down";

function Pill({
  label,
  status,
}: {
  label: string;
  status: Status;
}) {
  const styles = useMemo(() => {
    switch (status) {
      case "ok":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
      case "degraded":
        return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
      case "down":
        return "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
    }
  }, [status]);

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

export function ServiceStatusBar() {
  const [healthStatus, setHealthStatus] = useState<Status>("unknown");
  const [readinessStatus, setReadinessStatus] = useState<Status>("unknown");
  const [demo, setDemo] = useState(false);
  const [meta, setMeta] = useState<{
    twilioConfigured?: boolean;
    tavilyConfigured?: boolean;
    degradedComponents?: string[];
    checks?: { component: string; ok: boolean; detail?: string }[];
  }>({});
  const [expanded, setExpanded] = useState(false);

  async function refresh() {
    try {
      const h = await healthz();
      setHealthStatus(h.ok ? "ok" : "degraded");
      setMeta((m) => ({
        ...m,
        twilioConfigured: !!h.integrations?.twilio?.configured,
        tavilyConfigured: !!h.integrations?.tavily?.configured,
      }));
    } catch {
      setHealthStatus("down");
    }

    try {
      const r = await readiness();
      setReadinessStatus(r.ok ? "ok" : "degraded");
      setMeta((m) => ({
        ...m,
        degradedComponents: r.degraded_components || [],
        checks: r.checks?.map((c) => ({
          component: c.component,
          ok: c.ok,
          detail: c.detail,
        })),
      }));
    } catch {
      setReadinessStatus("down");
    }
  }

  useEffect(() => {
    setDemo(isDemoModeEnabled());
    refresh();
    const interval = window.setInterval(refresh, 45_000);
    const onFocus = () => refresh();
    const off = onDemoModeChange(() => setDemo(isDemoModeEnabled()));
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Pill label="API health" status={healthStatus} />
          <Pill label="Readiness" status={readinessStatus} />
          <Pill label={`Demo: ${demo ? "on" : "off"}`} status={demo ? "degraded" : "ok"} />
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <Pill
              label={`Twilio: ${meta.twilioConfigured ? "on" : "off"}`}
              status={meta.twilioConfigured ? "ok" : "degraded"}
            />
            <Pill
              label={`Tavily: ${meta.tavilyConfigured ? "on" : "off"}`}
              status={meta.tavilyConfigured ? "ok" : "degraded"}
            />
          </div>
        </div>

        <button
          type="button"
          className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Hide" : "Details"}
        </button>
      </div>

      {expanded && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">Demo mode</div>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setDemoModeEnabled(!demo)}
            >
              Turn {demo ? "off" : "on"}
            </button>
          </div>
          <div className="mt-1 text-zinc-600 dark:text-zinc-400">
            When enabled, the UI uses mocked responses so you can demo without a deployed backend.
          </div>

          <div className="font-medium">Degraded components</div>
          <div className="mt-1">
            {(meta.degradedComponents?.length || 0) > 0
              ? meta.degradedComponents?.join(", ")
              : "None"}
          </div>

          <div className="mt-3 font-medium">Checks</div>
          <div className="mt-1 grid gap-1">
            {(meta.checks || []).map((c) => (
              <div key={c.component} className="flex items-start justify-between gap-4">
                <div className="font-mono">{c.component}</div>
                <div className="text-right">
                  <div className={c.ok ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                    {c.ok ? "ok" : "fail"}
                  </div>
                  {c.detail ? (
                    <div className="max-w-[36ch] truncate text-zinc-500 dark:text-zinc-400" title={c.detail}>
                      {c.detail}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {(meta.checks || []).length === 0 ? (
              <div className="text-zinc-500 dark:text-zinc-400">
                No readiness checks returned.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

