import { DISCLAIMER_MATCH, DISCLAIMER_POLICY, DISCLAIMER_TRIAGE } from "@/lib/disclaimers";

function nowIso() {
  return new Date().toISOString();
}

export function mockHealthz() {
  return {
    ok: true,
    service: "carecompass",
    integrations: {
      twilio: { configured: false, from_set: false },
      tavily: { configured: false },
    },
    _demo: true,
    _generated_at: nowIso(),
  };
}

export function mockReadiness() {
  return {
    ok: false,
    status: "degraded",
    degraded_components: ["backend_unreachable"],
    checks: [
      { component: "workspace_auth", ok: false, detail: "demo mode: backend not deployed" },
      { component: "warehouse_query", ok: false, detail: "demo mode" },
      { component: "genie_ping", ok: false, detail: "demo mode" },
      { component: "vector_search_ping", ok: false, detail: "demo mode" },
      { component: "llm_ping", ok: false, detail: "demo mode" },
    ],
    _demo: true,
    _generated_at: nowIso(),
  };
}

export function mockTriageAnalyze(symptomsText: string) {
  const correlation_id = `demo_${Date.now()}`;
  return {
    session_id: `demo_session_${Math.random().toString(16).slice(2)}`,
    status: "analyzed",
    capabilities_needed: [
      "emergencyMedicine",
      "oxygenSupport",
      "imaging",
      "cardiacMonitoring",
    ],
    red_flags: [
      "Severe shortness of breath",
      "Chest pain with sweating or fainting",
      "Blue lips or confusion",
    ],
    query_used: `capability_match("${symptomsText.slice(0, 140)}")`,
    safety_disclaimer: DISCLAIMER_TRIAGE,
    graph_summary:
      "### Demo analysis\n\n- **This is demo data** (backend not reachable).\n- Captured symptoms: `" +
      symptomsText.replaceAll("`", "'") +
      "`\n\nNext step: click **Match facilities** to see a citation-backed facility list shape.",
    correlation_id,
    citations: [
      {
        source: "synthesis",
        field: "capabilities_needed",
        evidence_snippet:
          "Demo mode: capabilities inferred from the text input (not Databricks-backed).",
        confidence: 0.42,
        correlation_id,
      },
    ],
    degraded_components: ["backend_unreachable"],
    warnings: ["Demo mode active: using mocked responses."],
    _demo: true,
    _generated_at: nowIso(),
  };
}

export function mockTriageMatch(topK: number, stateHint?: string | null) {
  const correlation_id = `demo_${Date.now()}`;
  const facilities = [
    {
      name: "AIIMS Patna (demo)",
      district: "Patna",
      state: "Bihar",
      why: "High-capability tertiary center; likely ICU + imaging.",
    },
    {
      name: "PMCH Patna (demo)",
      district: "Patna",
      state: "Bihar",
      why: "Large public hospital with emergency and inpatient capacity.",
    },
    {
      name: "Nalanda Medical College (demo)",
      district: "Patna",
      state: "Bihar",
      why: "Teaching hospital; plausible imaging/OR access.",
    },
  ].slice(0, Math.max(1, Math.min(3, topK)));

  const md = [
    "### Demo facility matches",
    "",
    `State hint: **${stateHint || "—"}**`,
    "",
    ...facilities.map(
      (f, i) =>
        `${i + 1}. **${f.name}** — ${f.district}, ${f.state}\n   - Why: ${f.why}`,
    ),
    "",
    "#### Notes",
    "- This is **demo data** (no Databricks evidence).",
    "- In real mode, this section includes citations from Genie / Vector Search.",
  ].join("\n");

  return {
    safety_disclaimer: DISCLAIMER_MATCH,
    graph_summary: md,
    final_answer: md,
    degraded_components: ["backend_unreachable"],
    warnings: ["Demo mode active: using mocked responses."],
    correlation_id,
    citations: facilities.map((f) => ({
      source: "synthesis",
      facility: f.name,
      field: "match_reason",
      evidence_snippet: f.why,
      confidence: 0.35,
      correlation_id,
    })),
    extraction_result: {
      facilities: facilities.map((f) => ({
        name: f.name,
        district: f.district,
        state: f.state,
      })),
    },
    trust_artifacts: {
      note: "Demo mode: trust artifacts not available.",
      flags: [],
    },
    synthesis_artifacts: {
      top_k_requested: topK,
      state_hint: stateHint || null,
    },
    _demo: true,
    _generated_at: nowIso(),
  };
}

export function mockPolicyDeserts(params: { specialty: string; level: string }) {
  const correlation_id = `demo_${Date.now()}`;
  const desert_states = ["Bihar", "Jharkhand", "Assam", "Odisha"];
  const desert_pins = ["800001", "834001", "781001", "751001", "695001"];
  return {
    specialty: params.specialty,
    level: params.level,
    desert_states,
    desert_pins,
    desert_pin_ratio_interval: { point: 0.27, low_95: 0.21, high_95: 0.34 },
    citations: [
      {
        source: "synthesis",
        field: "deserts",
        evidence_snippet:
          "Demo mode: deserts list is illustrative only (backend not reachable).",
        confidence: 0.2,
        correlation_id,
      },
    ],
    safety_framing: DISCLAIMER_POLICY,
    correlation_id,
    _demo: true,
    _generated_at: nowIso(),
  };
}

export function mockPinRisk(pinCode: string) {
  const correlation_id = `demo_${Date.now()}`;
  return {
    pin_code: pinCode,
    facility_count: 12,
    high_trust_wilson: { point: 0.58, low_95: 0.41, high_95: 0.73 },
    sample_facilities: [
      { name: "District Hospital (demo)", trust: 0.62 },
      { name: "Private Clinic (demo)", trust: 0.44 },
    ],
    contrast_reasons: [
      "Some facilities report equipment without corresponding procedure volume (demo).",
      "Sparse reporting in PIN vs neighboring districts (demo).",
    ],
    citations: [
      {
        source: "synthesis",
        field: "pin-risk",
        evidence_snippet:
          "Demo mode: risk scoring is illustrative and not Databricks-backed.",
        confidence: 0.18,
        correlation_id,
      },
    ],
    safety_framing: DISCLAIMER_POLICY,
    correlation_id,
    _demo: true,
    _generated_at: nowIso(),
  };
}

