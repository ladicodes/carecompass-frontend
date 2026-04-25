import { getJson } from "@/lib/api/client";

export type HealthzResponse = {
  ok: boolean;
  service?: string;
  integrations?: {
    twilio?: { configured?: boolean; from_set?: boolean };
    tavily?: { configured?: boolean };
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

export type ReadinessCheck = {
  component: string;
  ok: boolean;
  detail?: string;
  [k: string]: unknown;
};

export type ReadinessResponse = {
  ok: boolean;
  status?: string;
  degraded_components?: string[];
  checks?: ReadinessCheck[];
  [k: string]: unknown;
};

export function healthz() {
  return getJson<HealthzResponse>("/healthz");
}

export function readiness() {
  return getJson<ReadinessResponse>("/readiness");
}

