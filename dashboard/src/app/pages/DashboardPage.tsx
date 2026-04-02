import { AnalysisPipeline } from "../components/dashboard/AnalysisPipeline";
import { KPIRow } from "../components/dashboard/KPIRow";
import { RiskDistribution } from "../components/dashboard/RiskDistribution";
import { ChurnReasonsChart } from "../components/dashboard/ChurnReasonsChart";

const S = {
  page: {
    padding:       "28px",
    display:       "flex",
    flexDirection: "column" as const,
    gap:           "22px",
    background:    "#141428",
    minHeight:     "100vh",
  },
  sectionLabel: {
    fontFamily:    "Inter, sans-serif",
    fontSize:      "10px",
    fontWeight:    600,
    letterSpacing: "1.2px",
    color:         "#7880A4",
    marginBottom:  "12px",
  },
};

export function DashboardPage() {
  return (
    <div style={S.page}>

      {/* ── Pipeline ─────────────────────────────── */}
      <AnalysisPipeline />

      {/* ── KPI Row ──────────────────────────────── */}
      <section>
        <p style={S.sectionLabel}>KEY METRICS — 이번 달 현황</p>
        <KPIRow />
      </section>

      {/* ── Reasons + Risk (한 줄 2컬럼) ── */}
      <section>
        <p style={S.sectionLabel}>CHURN ANALYTICS</p>
        <div
          className="reasons-risk-grid"
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr", // ← 동일 크기 2컬럼
            gap:                 "16px",
            alignItems:          "stretch",
          }}
        >
          <ChurnReasonsChart />
          <RiskDistribution />
        </div>
      </section>

      {/* bottom spacer */}
      <div style={{ height: "12px" }} />

      <style>{`
        @media (max-width: 900px) {
          .reasons-risk-grid { grid-template-columns: 1fr !important; }
          .kpi-row-grid      { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
