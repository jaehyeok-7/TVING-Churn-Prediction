// src/pages/ChurnActionPage.tsx  ← 새 파일 생성!
import { useSearchParams } from "react-router";
import { AlertTriangle, Target } from "lucide-react";
import { AnalysisPipeline } from "../components/dashboard/AnalysisPipeline";
import { ChurnRiskPage }    from "./ChurnRiskPage";
import { InterventionPage } from "./InterventionPage";

type TabId = "churn" | "action";

const TABS = [
  { id: "churn"  as TabId, label: "이탈 위험 분석", subLabel: "Churn Risk Analysis", icon: AlertTriangle, color: "#FFB74D" },
  { id: "action" as TabId, label: "개입 전략",      subLabel: "Intervention",        icon: Target,        color: "#E30613" },
];

export function ChurnActionPage() {
  const [params, setParams] = useSearchParams();
  const activeTab = (params.get("tab") as TabId) ?? "churn";
  const activeMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#141428", minHeight: "100vh" }}>

      {/* 파이프라인 + 탭바 고정 헤더 */}
      <div style={{ padding: "28px 28px 0 28px" }}>
        <AnalysisPipeline />

        {/* 탭 바 */}
        <div style={{ marginTop: "24px", background: "#1A1B35", border: "1px solid #2A2B45", borderRadius: "14px", padding: "6px", display: "flex", gap: "4px" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setParams({ tab: tab.id })}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "8px", padding: "10px 16px", borderRadius: "10px", border: "none",
                  cursor: "pointer", transition: "all 0.2s",
                  background: isActive ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)` : "transparent",
                  outline: isActive ? `1px solid ${tab.color}44` : "none",
                }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: isActive ? `${tab.color}30` : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={13} color={isActive ? tab.color : "#7880A4"} strokeWidth={2.5} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "13px", fontWeight: isActive ? 700 : 400, color: isActive ? "#FFFFFF" : "#7880A4", whiteSpace: "nowrap" }}>
                    {tab.label}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: isActive ? `${tab.color}BB` : "#4A5070", whiteSpace: "nowrap", marginTop: "1px" }}>
                    {tab.subLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 구분선 */}
        <div style={{ marginTop: "16px", marginBottom: "0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: activeMeta.color }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", color: "#7880A4" }}>
            {activeMeta.label.toUpperCase()} — {activeMeta.subLabel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 탭 콘텐츠 — embedded prop 없이 바로 렌더링 */}
      {activeTab === "churn"  && <ChurnRiskPage />}
      {activeTab === "action" && <InterventionPage />}
    </div>
  );
}
