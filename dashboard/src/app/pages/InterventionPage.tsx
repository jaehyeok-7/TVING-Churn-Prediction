import React from "react";
import { CheckCircle2, GitBranch } from "lucide-react";
import { usePeriodFilter } from "../contexts/PeriodFilterContext";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44",
  border: "#353F66",
  text: "#FFFFFF",
  sub: "#C4CAE0",
  muted: "#7880A4",
  purple: "#6C63FF",
  green: "#00D2A0",
  orange: "#FFB74D",
  highRisk: "#EF4444",
  midRisk: "#F59E0B",
  lowRisk: "#22C55E",
};

const STRATEGY_META = [
  {
    emoji: "🚨",
    riskLabel: "고위험군 대응",
    color: C.highRisk,
    glow: "rgba(227,6,19,0.15)",
    name: "단기 이탈 방지 및 락인 강화",
    items: [
      "광고형 연간권 파격 특가 (월 4,000원대)",
      "시청 중인 오리지널 최종화 긴급 푸시",
      "네이버플러스 멤버십 환승 혜택 안내",
      "이탈 고민 시점 '첫 달 100원' 복귀 프로모션",
    ],
    effect: "-41%",
    effectLabel: "이탈률 감소 예상",
    badge: "긴급",
    badgeBg: "rgba(227,6,19,0.15)",
  },
  {
    emoji: "⚠️",
    riskLabel: "중위험군 대응",
    color: C.orange,
    glow: "rgba(255,183,77,0.15)",
    name: "접속 습관 및 라이브 팬덤 강화",
    items: [
      "KBO 마이팀 실시간 경기 상황 알림 푸시",
      "인기 IP 스핀오프 오픈 소식",
      "티빙톡 참여 유도로 '노는 문화' 경험 제공",
      "본방 직후 Quick VOD 등록 리마인드",
    ],
    effect: "-28%",
    effectLabel: "방문 빈도 상승 예상",
    badge: "집중",
    badgeBg: "rgba(255,183,77,0.15)",
  },
  {
    emoji: "✅",
    riskLabel: "저위험군 대응",
    color: C.green,
    glow: "rgba(0,210,160,0.15)",
    name: "커뮤니티 소속감 및 경험 확장",
    items: [
      "오리지널 팝업 및 팬미팅 응모권 부여",
      "KBO 멀티뷰/타임머신 차별화 UX 가이드",
      "스포츠 굿즈 증정 등 VIP 로열티 이벤트",
    ],
    effect: "+15%",
    effectLabel: "LTV 상승 예상",
    badge: "자동화",
    badgeBg: "rgba(0,210,160,0.15)",
  },
];

type UsageSegmentKey = "binge" | "daily" | "snack";

const USAGE_SEGMENT_META: Array<{
  key: UsageSegmentKey;
  emoji: string;
  label: string;
  color: string;
  glow: string;
  name: string;
  items: string[];
  badge: string;
  badgeBg: string;
}> = [
  {
    key: "binge",
    emoji: "🎬",
    label: "정주행러",
    color: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.15)",
    name: "완주 흐름 유지 중심 대응",
    items: [
      "완주 임박 콘텐츠 기준 다음 회차/후속작 즉시 추천",
      "이어보기 진입 동선을 상단에 고정해 이탈 없는 연속 시청 유도",
      "선호 장르·시리즈 기반 유사 작품 큐레이션 강화",
    ],
    badge: "집중",
    badgeBg: "rgba(139, 92, 246, 0.15)",
  },
  {
    key: "daily",
    emoji: "📅",
    label: "일상러",
    color: "#60A5FA",
    glow: "rgba(96, 165, 250, 0.15)",
    name: "루틴형 재방문 강화 대응",
    items: [
      "평소 접속 시간대 기준 개인화 푸시 발송",
      "주간 업데이트/신규 공개작 요약으로 정기 재방문 유도",
      "자주 소비하는 장르 중심 홈 추천 영역 유지",
    ],
    badge: "유지",
    badgeBg: "rgba(96, 165, 250, 0.15)",
  },
  {
    key: "snack",
    emoji: "🍿",
    label: "찍먹러",
    color: "#F472B6",
    glow: "rgba(244, 114, 182, 0.15)",
    name: "가벼운 진입에서 시청 전환 대응",
    items: [
      "짧은 러닝타임·하이라이트 콘텐츠 우선 노출",
      "첫 시청 직후 유사 작품 1~2개만 간결하게 추천",
      "탐색 후 이탈 방지를 위한 즉시 재생형 큐레이션 제공",
    ],
    badge: "확장",
    badgeBg: "rgba(244, 114, 182, 0.15)",
  },
];

const rules = [
  {
    icon: "📺",
    borderColor: "#F59E0B",
    condition: "IF watch_time 전주 대비 50% 이상 감소",
    action: "→ 개인화 콘텐츠 추천 푸시",
    actionColor: "#F59E0B",
    desc: "시청 이탈 초기 단계. 콘텐츠 리텐션 전략",
  },
  {
    icon: "💳",
    borderColor: "#FBBF24",
    condition: "IF price_score > 0.8",
    action: "→ 맞춤형 할인 쿠폰 발송",
    actionColor: "#FBBF24",
    desc: "가격 민감도 상승. 혜택 안내 유도",
  },
  {
    icon: "🎯",
    borderColor: "#EF4444",
    condition: "IF completion_rate < 0.5",
    action: "→ 이어보기 알림 및 완주 유도 콘텐츠 재노출",
    actionColor: "#EF4444",
    desc: "완주율 하락 구간에서 이탈을 줄이기 위해 이어보기·완주 중심 개입 적용",
  },
  {
    icon: "🎬",
    borderColor: "#EF4444",
    condition: "IF segment_volume = Heavy_Viewer",
    action: "→ 다음 회차/후속작 중심 연속 시청 추천",
    actionColor: "#EF4444",
    desc: "정주행러의 완주 흐름을 유지하도록 이어보기·연속 시청 중심으로 개입",
  },
  {
    icon: "📅",
    borderColor: "#F59E0B",
    condition: "IF segment_volume = Medium_Viewer",
    action: "→ 개인화 리마인드 및 주간 추천 노출",
    actionColor: "#F59E0B",
    desc: "일상러의 재방문 루틴을 유지하기 위해 시간대 기반 알림과 정기 추천 적용",
  },
  {
    icon: "🍿",
    borderColor: "#22C55E",
    condition: "IF segment_volume = Low_Viewer",
    action: "→ 짧은 콘텐츠·하이라이트 우선 추천",
    actionColor: "#22C55E",
    desc: "찍먹러가 부담 없이 다시 진입할 수 있도록 짧은 콘텐츠 중심으로 전환 유도",
  },
];

function getUsageSegmentKey(user: any): UsageSegmentKey {
  if (
    user?.segment_volume === "Heavy_Viewer" ||
    user?.segment === "Power User"
  ) {
    return "binge";
  }

  if (
    user?.segment_volume === "Medium_Viewer" ||
    user?.segment === "Regular User"
  ) {
    return "daily";
  }

  return "snack";
}

function formatCount(count: number): string {
  return `${count.toLocaleString()}명`;
}

export function InterventionPage({ embedded = false }: { embedded?: boolean }) {
  void embedded;

  const { interventionData } = usePeriodFilter();
  const { strategyTargets } = interventionData;
  const { users } = useSheetData();

  const usageSegmentCounts = users.reduce<Record<UsageSegmentKey, number>>(
    (acc, user) => {
      const key = getUsageSegmentKey(user);
      acc[key] += 1;
      return acc;
    },
    { binge: 0, daily: 0, snack: 0 }
  );

  return (
    <div
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        background: "#101827",
        minHeight: "100vh",
      }}
    >
      {/* ── 1. 기존 위험군 대응 카드 (하단 수치 영역 제거) ── */}
      <section>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.2px",
            color: C.muted,
            marginBottom: "12px",
          }}
        >
          세그먼트별 개입 전략
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          {STRATEGY_META.map((s, idx) => {
            const target = strategyTargets[idx] ?? "-";

            return (
              <div
                key={idx}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "22px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: s.glow,
                    filter: "blur(28px)",
                    pointerEvents: "none",
                  }}
                />

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.emoji} {s.riskLabel}
                    </span>

                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: s.badgeBg,
                        border: `1px solid ${s.color}30`,
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      margin: "0 0 4px",
                    }}
                  >
                    {s.name}
                  </p>

                  <p
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "12px",
                      color: C.sub,
                      margin: 0,
                    }}
                  >
                    대상: <strong style={{ color: C.text }}>{target}</strong>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {s.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        color={s.color}
                        strokeWidth={2.5}
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span
                        style={{
                          fontFamily: "Pretendard, sans-serif",
                          fontSize: "12px",
                          color: C.sub,
                          lineHeight: 1.4,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. 사용 세그먼트 기반 대응 추가 ── */}
      <section>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.2px",
            color: C.muted,
            marginBottom: "12px",
          }}
        >
          사용 세그먼트 기반 대응
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          {USAGE_SEGMENT_META.map((s) => {
            const target =
              s.key === "binge"
                ? formatCount(usageSegmentCounts.binge)
                : s.key === "daily"
                ? formatCount(usageSegmentCounts.daily)
                : formatCount(usageSegmentCounts.snack);

            return (
              <div
                key={s.key}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "22px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: s.glow,
                    filter: "blur(28px)",
                    pointerEvents: "none",
                  }}
                />

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.emoji} {s.label}
                    </span>

                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: s.badgeBg,
                        border: `1px solid ${s.color}30`,
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      margin: "0 0 4px",
                    }}
                  >
                    {s.name}
                  </p>

                  <p
                    style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "12px",
                      color: C.sub,
                      margin: 0,
                    }}
                  >
                    대상: <strong style={{ color: C.text }}>{target}</strong>
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {s.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        color={s.color}
                        strokeWidth={2.5}
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <span
                        style={{
                          fontFamily: "Pretendard, sans-serif",
                          fontSize: "12px",
                          color: C.sub,
                          lineHeight: 1.4,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Rule-based Intervention ── */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <GitBranch size={15} color={C.purple} />
          <h3
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Rule-based Intervention
          </h3>
        </div>

        <p
          style={{
            fontFamily: "Pretendard, sans-serif",
            fontSize: "11px",
            color: C.sub,
            margin: "0 0 20px",
          }}
        >
          모델 점수 + 행동 패턴 + 사용 세그먼트 기반 자동 액션 추천
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {rules.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#161E2E",
                borderRadius: "10px",
                borderLeft: `4px solid ${r.borderColor}`,
                padding: "14px 16px",
                borderTop: `1px solid ${r.borderColor}18`,
                borderRight: `1px solid ${r.borderColor}18`,
                borderBottom: `1px solid ${r.borderColor}18`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "16px" }}>{r.icon}</span>
                <code
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.text,
                    background: "rgba(255,255,255,0.06)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {r.condition}
                </code>
              </div>

              <p
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: r.actionColor,
                  margin: "0 0 5px",
                }}
              >
                {r.action}
              </p>

              <p
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "11px",
                  color: "#9CA3AF",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}