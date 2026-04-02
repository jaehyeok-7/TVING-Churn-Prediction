import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, X } from "lucide-react";

type NotifType = "danger" | "warning" | "system";
type TabFilter = "all" | "danger" | "warning" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  content: string;
  time: string;
  read: boolean;
  dotColor: string;
  action?: { label: string; path: string };
}

const INITIAL: Notification[] = [
  {
    id: "1",
    type: "danger",
    title: "High Risk 유저 급증 감지",
    content: "2,156명 (+18.3%) — 전일 대비 이상 증가",
    time: "2분 전",
    read: false,
    dotColor: "#EF4444",
    action: { label: "이탈 위험 분석 →", path: "/churn-risk" },
  },
  {
    id: "2",
    type: "warning",
    title: "Predicted Churn Rate 목표 초과",
    content: "24.6% — 목표치(20%) 초과. 개입 전략 검토 필요",
    time: "15분 전",
    read: false,
    dotColor: "#F59E0B",
    action: { label: "개입 전략 →", path: "/intervention" },
  },
  {
    id: "3",
    type: "warning",
    title: "결제 실패 사용자 급증",
    content: "payment_fail=1 사용자 +87명 — 비자발 이탈 위험",
    time: "3시간 전",
    read: false,
    dotColor: "#F59E0B",
    action: { label: "고위험군 보기 →", path: "/churn-risk" },
  },
  {
    id: "4",
    type: "system",
    title: "ML 모델 업데이트 완료",
    content: "오늘 00:00 예측 완료 — 50,247명 스코어링",
    time: "오늘 00:01",
    read: true,
    dotColor: "#22C55E",
  },
  {
    id: "5",
    type: "system",
    title: "데이터 최신화 완료",
    content: "기준 시점: 2025-03-07 23:59",
    time: "오늘 00:02",
    read: true,
    dotColor: "#6B7280",
  },
];

const TABS: { id: TabFilter; label: string }[] = [
  { id: "all",     label: "전체"      },
  { id: "danger",  label: "🔴 위험"  },
  { id: "warning", label: "🟡 경고"  },
  { id: "system",  label: "⚙️ 시스템" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [tab, setTab]     = useState<TabFilter>("all");
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (tab === "all")     return true;
    if (tab === "danger")  return n.type === "danger";
    if (tab === "warning") return n.type === "warning";
    if (tab === "system")  return n.type === "system";
    return true;
  });

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const removeNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll    = () => setNotifs([]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.60)",
          zIndex: 998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Slide-in panel ── */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "380px",
          background: "#222B44",
          borderLeft: "1px solid #353F66",
          zIndex: 999,
          transform: open ? "translateX(0)" : "translateX(105%)",
          transition: open
            ? "transform 0.32s cubic-bezier(0.16,1,0.3,1), box-shadow 0.32s ease"
            : "transform 0.26s cubic-bezier(0.55,0,1,0.45)",
          display: "flex", flexDirection: "column",
          boxShadow: open ? "-24px 0 80px rgba(0,0,0,0.8), -1px 0 0 rgba(255,255,255,0.04)" : "none",
        }}
      >
        {/* ── Panel Header ── */}
        <div
          style={{
            padding: "20px 20px 0",
            borderBottom: "1px solid #2D3352",
            flexShrink: 0,
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={16} color="#FF153C" strokeWidth={2} />
                <span style={{
                  fontFamily: "Pretendard, Inter, sans-serif",
                  fontSize: "16px", fontWeight: 700, color: "#FFFFFF",
                }}>
                  알림 센터
                </span>
              </div>
              <p style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "12px", color: "#B8BDD6",
                margin: "4px 0 0",
              }}>
                {unreadCount > 0 ? `${unreadCount}개의 새 알림` : "새 알림 없음"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={markAllRead}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9CA3AF",
                  padding: "4px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF")}
              >
                모두 읽음
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #2D3352",
                  borderRadius: "6px", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
              >
                <X size={13} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* Tab filters */}
          <div style={{ display: "flex", gap: 0, marginBottom: "-1px" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 14px",
                  background: "none", border: "none",
                  borderBottom: tab === t.id ? "2px solid #FF153C" : "2px solid transparent",
                  cursor: "pointer",
                  fontFamily: "Pretendard, Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: tab === t.id ? 700 : 400,
                  color: tab === t.id ? "#FFFFFF" : "#B8BDD6",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (tab !== t.id) (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { if (tab !== t.id) (e.currentTarget as HTMLButtonElement).style.color = "#B8BDD6"; }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notification list ── */}
        <div
          style={{ flex: 1, overflowY: "auto" }}
          className="notif-scroll"
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "56px 20px", textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <Bell size={22} color="#68718F" />
              </div>
              <p style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "14px", color: "#68718F", margin: 0,
              }}>
                알림이 없습니다
              </p>
            </div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "relative",
                  padding: "16px 20px",
                  background: n.read ? "#151E2D" : "#1E2A3D",
                  borderLeft: n.read ? "4px solid transparent" : `4px solid ${n.dotColor}`,
                  borderBottom: "1px solid #2D3352",
                  transition: "background 0.15s",
                }}
              >
                {/* ── Hover X button ── */}
                {hoveredId === n.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                    style={{
                      position: "absolute", top: "12px", right: "14px",
                      width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid #2D3352",
                      borderRadius: "4px", cursor: "pointer",
                    }}
                  >
                    <X size={11} color="#9CA3AF" />
                  </button>
                )}

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  {/* Color dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    marginTop: "5px",
                    background: n.read ? n.dotColor + "55" : n.dotColor,
                    boxShadow: n.read ? "none" : `0 0 6px ${n.dotColor}80`,
                  }} />

                  {/* Content */}
                  <div style={{
                    flex: 1, minWidth: 0,
                    paddingRight: hoveredId === n.id ? "28px" : "0",
                  }}>
                    <p style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "13px", fontWeight: 600,
                      color: n.read ? "#6B7280" : "#FFFFFF",
                      margin: "0 0 3px", lineHeight: 1.4,
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontFamily: "Pretendard, sans-serif",
                      fontSize: "12px",
                      color: n.read ? "#6B7280" : "#9CA3AF",
                      margin: "0 0 8px", lineHeight: 1.4,
                    }}>
                      {n.content}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px", color: "#68718F",
                      }}>
                        {n.time}
                      </span>
                      {n.action && (
                        <button
                          onClick={() => { navigate(n.action!.path); onClose(); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontFamily: "Pretendard, sans-serif",
                            fontSize: "11px", fontWeight: 700,
                            color: n.dotColor, padding: 0,
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                        >
                          {n.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Panel Footer ── */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #2D3352",
          textAlign: "center",
          flexShrink: 0,
        }}>
          <button
            onClick={clearAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Pretendard, sans-serif",
              fontSize: "13px", color: "#9CA3AF",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF")}
          >
            모든 알림 지우기
          </button>
        </div>

        {/* Scrollbar */}
        <style>{`
          .notif-scroll::-webkit-scrollbar { width: 4px; }
          .notif-scroll::-webkit-scrollbar-track { background: #222B44; }
          .notif-scroll::-webkit-scrollbar-thumb { background: #2D3352; border-radius: 2px; }
          .notif-scroll::-webkit-scrollbar-thumb:hover { background: #4A5470; }
        `}</style>
      </div>
    </>
  );
}