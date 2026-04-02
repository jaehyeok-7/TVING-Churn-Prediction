import { useSearchParams } from "react-router";
import { Activity, Timer, Users } from "lucide-react";
import { AnalysisPipeline } from "../components/dashboard/AnalysisPipeline";
import { ServiceStatusPage } from "./ServiceStatusPage";
import { BehaviorPatternsPage } from "./BehaviorPatternsPage";
import { UserAnalysisPage } from "./UserAnalysisPage";

type TabId = "service" | "behavior" | "user";

const TABS = [
  {
    id: "service" as TabId,
    label: "서비스 상태",
    subLabel: "Service Status",
    icon: Activity,
    color: "#00D2A0",
  },
  {
    id: "behavior" as TabId,
    label: "사용자 행동 패턴",
    subLabel: "Behavior Patterns",
    icon: Timer,
    color: "#6C63FF",
  },
  {
    id: "user" as TabId,
    label: "사용자 분석",
    subLabel: "User Analysis",
    icon: Users,
    color: "#FFB74D",
  },
];

export function AnalysisPage() {
  const [params, setParams] = useSearchParams();
  const activeTab = (params.get("tab") as TabId) ?? "service";
  const activeMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        background: "#141428",
        minHeight: "100vh",
      }}
    >
      <AnalysisPipeline />

      {/* 탭 바 */}
      <div
        style={{
          marginTop: "24px",
          background: "#1A1B35",
          border: "1px solid #2A2B45",
          borderRadius: "14px",
          padding: "6px",
          display: "flex",
          gap: "4px",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setParams({ tab: tab.id })}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: isActive
                  ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)`
                  : "transparent",
                outline: isActive
                  ? `1px solid ${tab.color}44`
                  : "none",
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "7px",
                  background: isActive
                    ? `${tab.color}30`
                    : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={13}
                  color={isActive ? tab.color : "#7880A4"}
                  strokeWidth={2.5}
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "Pretendard, Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#FFFFFF" : "#7880A4",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    color: isActive
                      ? `${tab.color}BB`
                      : "#4A5070",
                    whiteSpace: "nowrap",
                    marginTop: "1px",
                  }}
                >
                  {tab.subLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 구분선 */}
      <div
        style={{
          marginTop: "20px",
          marginBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "16px",
            borderRadius: "2px",
            background: activeMeta.color,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1px",
            color: "#7880A4",
          }}
        >
          {activeMeta.label.toUpperCase()} —{" "}
          {activeMeta.subLabel.toUpperCase()}
        </span>
      </div>

      {/* 콘텐츠 */}
      <div style={{ marginTop: "8px" }}>
        {activeTab === "service" && (
          <ServiceStatusPage embedded />
        )}
        {activeTab === "behavior" && (
          <BehaviorPatternsPage embedded />
        )}
        {activeTab === "user" && <UserAnalysisPage embedded />}
      </div>
    </div>
  );
}