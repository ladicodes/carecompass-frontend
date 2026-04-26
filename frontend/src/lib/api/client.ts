export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [k: string]: JsonValue };

export class ApiError extends Error {
  status: number;
  detail?: string;
  correlationId?: string;
  raw?: unknown;

  constructor(message: string, opts: { status: number; detail?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.detail = opts.detail;
  }
}

let lastRequestId: string | null = null;
let didAutoEnableDemo = false;

function makeRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function apiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_CARECOMPASS_API_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/+$/, "");
}

async function maybeMock<T>(path: string, init?: RequestInit): Promise<T | null> {
  const { isDemoModeEnabled, setDemoModeEnabled } = await import("@/lib/demo/mode");
  if (!isDemoModeEnabled()) return null;

  const { mockHealthz, mockPinRisk, mockPolicyDeserts, mockReadiness, mockTriageAnalyze, mockTriageMatch } =
    await import("@/lib/demo/mocks");

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized === "/healthz") return mockHealthz() as T;
  if (normalized === "/readiness") return mockReadiness() as T;

  if (normalized === "/triage/analyze") {
    let symptoms = "";
    try {
      if (typeof init?.body === "string") {
        const parsed = JSON.parse(init.body) as any;
        symptoms = String(parsed?.symptoms_text || "");
      }
    } catch {
      // ignore
    }
    return mockTriageAnalyze(symptoms) as T;
  }

  if (normalized === "/triage/match_facilities") {
    let topK = 10;
    let stateHint: string | null | undefined = null;
    try {
      if (typeof init?.body === "string") {
        const parsed = JSON.parse(init.body) as any;
        topK = Number(parsed?.top_k ?? 10);
        stateHint = parsed?.state_hint ?? null;
      }
    } catch {
      // ignore
    }
    return mockTriageMatch(topK, stateHint) as T;
  }

  if (normalized.startsWith("/policy/deserts")) {
    const u = new URL(`http://local${normalized}`);
    const specialty = u.searchParams.get("specialty") || "emergency";
    const level = u.searchParams.get("level") || "pin";
    return mockPolicyDeserts({ specialty, level }) as T;
  }

  if (normalized.startsWith("/policy/pin-risk/")) {
    const pin = normalized.split("/").pop() || "000000";
    return mockPinRisk(pin) as T;
  }

  // If a route isn't mocked, keep demo on but let caller see failure.
  // Still, if we got here via auto-enable, callers will see consistent UI for core routes.
  setDemoModeEnabled(true);
  return null;
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { _parse_error: true, _raw_text: text };
  }
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit & { requestId?: string },
): Promise<T> {
  const preMock = await maybeMock<T>(path, init);
  if (preMock !== null) return preMock;

  const requestId = init?.requestId || lastRequestId || makeRequestId();
  lastRequestId = requestId;

  const url = `${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-Id", requestId);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
    });
  } catch (e) {
    // Automatic fallback: if backend isn't reachable, enable demo once and retry mock.
    if (!didAutoEnableDemo) {
      didAutoEnableDemo = true;
      const { setDemoModeEnabled } = await import("@/lib/demo/mode");
      setDemoModeEnabled(true);
      const mock = await maybeMock<T>(path, init);
      if (mock !== null) return mock;
    }
    throw e;
  }

  const data = await readJsonSafe(res);

  // HTTP error pattern: { "detail": "..." }
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as any).detail)
        : undefined;
    throw new ApiError(detail || `Request failed (${res.status})`, {
      status: res.status,
      detail,
    });
  }

  // Logical error pattern: HTTP 200 but { error, status }
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    "status" in data &&
    typeof (data as any).status === "number"
  ) {
    const status = Number((data as any).status);
    const msg = String((data as any).error || "Request failed");
    const err = new ApiError(msg, { status, detail: msg });
    err.raw = data;
    if ("correlation_id" in data) {
      err.correlationId = String((data as any).correlation_id);
    }
    throw err;
  }

  return data as T;
}

export async function getJson<T>(path: string, init?: RequestInit) {
  return requestJson<T>(path, { ...init, method: "GET" });
}

export async function postJson<T>(path: string, body: unknown, init?: RequestInit) {
  return requestJson<T>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
  });
}

