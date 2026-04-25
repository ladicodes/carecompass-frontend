import { postJson } from "@/lib/api/client";

export type CitationRecord = {
  source?: string;
  facility?: string;
  field?: string;
  evidence_snippet?: string;
  confidence?: number;
  row_id?: string;
  correlation_id?: string;
  [k: string]: unknown;
};

export type TriageSessionResponse = {
  session_id: string;
  status?: string;
  capabilities_needed?: string[];
  red_flags?: string[];
  query_used?: string;
  safety_disclaimer?: string;
  graph_summary?: string | null;
  correlation_id?: string;
  citations?: CitationRecord[];
  degraded_components?: string[];
  warnings?: string[];
  [k: string]: unknown;
};

export type TriageAnalyzeRequest = {
  symptoms_text: string;
  metadata?: Record<string, unknown>;
};

export type TriageMatchRequest = {
  session_id: string;
  top_k?: number;
  state_hint?: string | null;
};

export type TriageMatchResponse = {
  safety_disclaimer?: string;
  graph_summary?: string | null;
  final_answer?: string | null;
  degraded_components?: string[];
  warnings?: string[];
  correlation_id?: string;
  citations?: CitationRecord[];
  extraction_result?: unknown;
  trust_artifacts?: unknown;
  synthesis_artifacts?: unknown;
  [k: string]: unknown;
};

export function triageAnalyze(body: TriageAnalyzeRequest) {
  return postJson<TriageSessionResponse>("/triage/analyze", body);
}

export function triageMatchFacilities(body: TriageMatchRequest) {
  return postJson<TriageMatchResponse>("/triage/match_facilities", body);
}

