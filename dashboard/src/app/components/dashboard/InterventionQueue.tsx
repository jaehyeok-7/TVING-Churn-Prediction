import React, { useMemo } from "react";
import { Zap, Mail, Gift, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
// ★ Context에서 데이터 가져오기 위해 추가
import { useSheetData } from "../../contexts/SheetDataContext";

type ActionStatus = "active" | "pending" | "done";

type Action = {
  id: number;
  type: string;
  title: string;
  target: string;
  targetCount: number;
  status: ActionStatus;
  scheduledAt: string;
  successRate?: number;
  icon: React.ElementType;
  color: string;
};

const statusConfig: Record<ActionStatus, { label: string; color: string; bg: string }> = {
  active:  { label: "실행 중",  color: "#00D2A0", bg: "rgba(0,210,160,0.12)" },
  pending: { label: "예정",    color: "#FFB74D",  bg: "rgba(255,183,77,0.12)" },
  done:    { label: "완료",    color: "#B8BDD6",  bg: "rgba(184,189,214,0.1)" },
};

const riskColor: Record<string, string> = {
  "고위험": "#E30613",
  "중위험": "#FFB74D",
  "저위험": "#00D2A0",
};

export function InterventionQueue() {
  // 1. Context에서 전체 유저 데이터 불러오기
  const { dashboardData } = useSheetData();

  // 2. 고위험군, 중위험군 유저 수 실시간 계산
  const { highRiskCount, midRiskCount } = useMemo(() => {
    if (!dashboardData) return { highRiskCount: 0, midRiskCount: 0 };
    const high = dashboardData.filter((d: any) => d.risk_band === "High Risk").length;
    const mid = dashboardData.filter((d: any) => d.risk_band === "Mid Risk").length;
    return { highRiskCount: high, midRiskCount: mid };
  }, [dashboardData]);

  // 3. actions 배열을 컴포넌트 내부로 가져와 타겟 수(targetCount)를 동적으로 할당
  const actions: Action[] = useMemo(() => [
    {
      id: 1,
      type: "긴급 캠페인",
      title: "고위험군 30일 할인 쿠폰",
      target: "고위험",
      targetCount: highRiskCount, // 실데이터 연동
      status: "active",
      scheduledAt: "실행 중",
      successRate: 71, // 시뮬레이션 성공률
      icon: Zap,
      color: "#E30613",
    },
    {
      id: 2,
      type: "이메일 시퀀스",
      title: "콘텐츠 큐레이션 추천 메일",
      target: "중위험",
      targetCount: midRiskCount, // 실데이터 연동
      status: "active",
      scheduledAt: "D+2 예정",
      successRate: 58,
      icon: Mail,
      color: "#6C63FF",
    },
    {
      id: 3,
      type: "보상 프로그램",
      title: "시즌2 공개 알림 + 무료 에피소드",
      target: "고위험",
      targetCount: highRiskCount, // 실데이터 연동
      status: "pending",
      scheduledAt: "3/15 예정",
      icon: Gift,
      color: "#FFB74D",
    },
    {
      id: 4,
      type: "인앱 메시지",
      title: "개인화 복귀 유도 팝업",
      target: "중위험",
      targetCount: midRiskCount, // 실데이터 연동
      status: "pending",
      scheduledAt: "3/18 예정",
      icon: MessageSquare,
      color: "#00D2A0",
    },
    {
      id: 5,
      type: "캠페인",
      title: "2월 윈백 SMS 발송",
      target: "고위험",
      targetCount: highRiskCount, // 실데이터 연동
      status: "done",
      scheduledAt: "2/28 완료",
      successRate: 64,
      icon: CheckCircle2,
      color: "#00D2A0",
    },
  ], [highRiskCount, midRiskCount]);

  // 4. 상단 요약(Summary) 수치 자동 계산 로직
  // 중복 타겟팅을 고려하지 않은 단순 합산 총 타겟수
  const totalTargetUsers = actions.reduce((sum, a) => sum + a.targetCount, 0);
  // 성공률이 있는 캠페인들의 평균 성공률 계산
  const successActions = actions.filter(a => a.successRate != null);
  const avgSuccessRate = successActions.length > 0 
    ? successActions.reduce((sum, a) => sum + a.successRate!, 0) / successActions.length 
    : 0;
  // 타겟 수 * 성공률을 통한 절감 예상 이탈 수 계산
  const expectedSaved = actions.reduce((sum, a) => sum + (a.targetCount * ((a.successRate || 0) / 100)), 0);

  return (
    <div
      style={{
        background: "#222B44",
        border: "1px solid #2D3352",
        borderRadius: "12px",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "Pretendard, Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 4px 0",
            }}
          >
            개입 실행 현황
          </h3>
          <p
            style={{
              fontFamily: "Pretendard, Inter, sans-serif",
              fontSize: "12px",
              color: "#B8BDD6",
              margin: 0,
            }}
          >
            활성 {actions.filter(a => a.status === "active").length}건 · 예정 {actions.filter(a => a.status === "pending").length}건
          </p>
        </div>
        <button
          style={{
            padding: "6px 14px",
            background: "rgba(255,21,60,0.1)",
            border: "1px solid rgba(255,21,60,0.3)",
            borderRadius: "7px",
            cursor: "pointer",
            fontFamily: "Pretendard, Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "#FF153C",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(255,21,60,0.18)"; el.style.boxShadow = "0 0 12px rgba(255,21,60,0.2)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(255,21,60,0.10)"; el.style.boxShadow = "none"; }}
        >
          + 전략 추가
        </button>
      </div>

      {/* Summary row - 자동 계산된 동적 데이터 맵핑 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        {[
          { label: "총 타겟 사용자", value: totalTargetUsers.toLocaleString(), color: "#6C63FF" },
          { label: "평균 성공률",    value: `${avgSuccessRate.toFixed(1)}%`,  color: "#00D2A0" },
          { label: "절감 예상 이탈", value: `~${Math.round(expectedSaved).toLocaleString()}`, color: "#FFB74D" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid #2D3352`,
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
                marginBottom: "3px",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "Pretendard, Inter, sans-serif",
                fontSize: "10px",
                color: "#B8BDD6",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((action) => {
          const Icon = action.icon;
          const sc = statusConfig[action.status];
          return (
            <div
              key={action.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 12px",
                background:
                  action.status === "active"
                    ? `${action.color}0C`
                    : "rgba(255,255,255,0.025)",
                border: `1px solid ${action.status === "active" ? action.color + "30" : "#2D3352"}`,
                borderRadius: "8px",
                transition: "all 0.15s",
                cursor: "pointer",
                opacity: action.status === "done" ? 0.65 : 1,
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = action.status === "active" ? `${action.color}18` : "rgba(255,255,255,0.05)"; el.style.transform = "translateX(2px)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = action.status === "active" ? `${action.color}0C` : "rgba(255,255,255,0.025)"; el.style.transform = "translateX(0)"; }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: `${action.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={action.color} strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span
                    style={{
                      fontFamily: "Pretendard, Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {action.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontFamily: "Pretendard, Inter, sans-serif",
                      fontSize: "10px",
                      color: riskColor[action.target] ?? "#B8BDD6",
                      background: `${riskColor[action.target] ?? "#B8BDD6"}15`,
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {action.target}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#B8BDD6",
                    }}
                  >
                    {action.targetCount.toLocaleString()}명
                  </span>
                  <span style={{ color: "#2D3352", fontSize: "10px" }}>·</span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#68718F",
                    }}
                  >
                    {action.type}
                  </span>
                </div>
              </div>

              {/* Right side */}
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: sc.bg,
                    marginBottom: "4px",
                  }}
                >
                  {action.status === "active" && (
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: sc.color,
                        animation: "pulse-q 1.5s ease infinite",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: sc.color,
                    }}
                  >
                    {sc.label}
                  </span>
                </div>
                {action.successRate != null && (
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#00D2A0",
                    }}
                  >
                    {action.successRate}% ✓
                  </div>
                )}
                {action.successRate == null && (
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      color: "#68718F",
                    }}
                  >
                    {action.scheduledAt}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-q {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}