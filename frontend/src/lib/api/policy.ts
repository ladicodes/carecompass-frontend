import { getJson } from "@/lib/api/client";
import type { CitationRecord } from "@/lib/api/triage";

export type WilsonInterval = {
  point?: number;
  low_95?: number;
  high_95?: number;
  [k: string]: unknown;
};

export type PolicyDesertsResponse = {
  specialty?: string;
  level?: "pin" | "state" | string;
  desert_states?: string[];
  desert_pins?: string[];
  counts?: Record<string, unknown>;
  desert_pin_ratio_interval?: WilsonInterval;
  citations?: CitationRecord[];
  safety_framing?: string;
  correlation_id?: string;
  [k: string]: unknown;
};

export type PinRiskResponse = {
  pin_code?: string;
  facility_count?: number;
  high_trust_wilson?: WilsonInterval;
  sample_facilities?: unknown[];
  contrast_reasons?: string[];
  citations?: CitationRecord[];
  safety_framing?: string;
  correlation_id?: string;
  [k: string]: unknown;
};

export function getPolicyDeserts(params: {
  specialty: string;
  level: "pin" | "state";
}) {
  const qs = new URLSearchParams({ specialty: params.specialty, level: params.level });
  return getJson<PolicyDesertsResponse>(`/policy/deserts?${qs.toString()}`);
}

export function getPinRisk(pinCode: string) {
  return getJson<PinRiskResponse>(`/policy/pin-risk/${encodeURIComponent(pinCode)}`);
}

