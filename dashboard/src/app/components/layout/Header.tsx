import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";
import { Bell, Download, Calendar, ChevronDown, X, RefreshCw } from "lucide-react";
import { usePeriodFilter, Period } from "../../contexts/PeriodFilterContext";
import { useSheetData } from "../../contexts/SheetDataContext";
import { CalendarPicker } from "../shared/CalendarPicker";
import { NotificationPanel } from "./NotificationPanel";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/":                  { title: "Dashboard",          subtitle: "이탈 분석 전체 현황 개요"        },
  "/service-status":    { title: "서비스 상태",          subtitle: "플랫폼 운영 현황 및 핵심 지표"   },
  "/user-analysis":     { title: "사용자 분석",          subtitle: "사용자 세그먼트 및 코호트 분석"  },
  "/behavior-patterns": { title: "사용자 행동 패턴 분석",subtitle: "콘텐츠 소비 및 세션 패턴 인사이트"},
  "/churn-risk":        { title: "이탈 위험 분석",       subtitle: "이탈 예측 모델 및 위험 사용자 분류"},
  "/intervention":      { title: "개입 전략",            subtitle: "마케팅 액션 플랜 및 실행 현황"   },
  "/drilldown/risk":    { title: "Risk Drilldown",      subtitle: "Risk Band 사용자 상세 분석"      },
  "/drilldown/device":  { title: "Device Analysis",    subtitle: "디바이스별 사용자 행동 분석"      },
  "/drilldown/segment": { title: "Segment Analysis",   subtitle: "세그먼트별 행동 패턴 분석"        },
};

const C = {
  bg: "#141428", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", red: "#E30613", card: "#222B44",
  tvRed: "#FF153C", purple: "#6C63FF",
};

const PERIODS: Period[] = ["7D", "30D", "90D", "6M"];

/** "2026-01-15" → "Jan 15" */
function fmtDate(iso: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = iso.split("-");
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${months[m]} ${String(d).padStart(2, "0")}`;
}

export function Header() {
  const { pathname } = useLocation();
  const pageInfo = Object.entries(PAGE_TITLES).find(([k]) =>
    k === "/" ? pathname === "/" : pathname.startsWith(k)
  )?.[1] ?? PAGE_TITLES["/"];

  const ctx = usePeriodFilter();
  const { period, setPeriod, isCustom, customRange, setCustom, clearCustom } = ctx;
  const activeRange = ctx.activeRange ?? { start: "2026-02-13", end: "2026-03-15", label: "최근 30일", desc: "2026.02.13 ~ 03.15" };
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  /* Google Sheets 연결 상태 */
  const sheet = useSheetData();

  /* Close calendar on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const customStartFmt = isCustom ? fmtDate(customRange.start) : "";
  const customEndFmt   = isCustom ? fmtDate(customRange.end)   : "";

  /* 상태 배지 설정 */
  const statusBadge =
    sheet.status === "loading"
      ? { dot: "#F59E0B", text: "데이터 불러오는 중...", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" }
      : sheet.status === "success"
      ? { dot: "#22C55E", text: `실데이터 연결됨 | ${sheet.dataCount.toLocaleString()}명 | 2025-12-10 기준`, bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.28)" }
      : { dot: "#EF4444", text: "연결 오류 — 시트 공유 설정 확인", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" };

  return (
    <>
    <header
      style={{
        height: "64px",
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: "14px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <h1 style={{ fontFamily: "Inter, Pretendard, sans-serif", fontSize: "17px", fontWeight: 700, color: C.text, margin: 0, lineHeight: 1, whiteSpace: "nowrap" }}>
            {pageInfo.title}
          </h1>
          <span style={{ fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px", color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {pageInfo.subtitle}
          </span>
        </div>
      </div>

      {/* ── 데이터 연결 상태 배지 ── */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 11px",
          background: statusBadge.bg,
          border: `1px solid ${statusBadge.border}`,
          borderRadius: "20px",
          flexShrink: 0,
          cursor: sheet.status === "error" ? "pointer" : "default",
        }}
        onClick={() => sheet.status === "error" && sheet.refresh()}
        title={sheet.status === "error" ? "클릭하여 다시 시도" : sheet.lastUpdated ? `마지막 갱신: ${sheet.lastUpdated}` : ""}
      >
        {sheet.status === "loading" ? (
          <RefreshCw size={9} color={statusBadge.dot} style={{ animation: "spin-badge 1s linear infinite" }} />
        ) : (
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusBadge.dot, boxShadow: `0 0 6px ${statusBadge.dot}` }} />
        )}
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, color: statusBadge.dot, whiteSpace: "nowrap" }}>
          {statusBadge.text}
        </span>
      </div>

      {/* ── Date range button + calendar ── */}
      <div ref={calRef} style={{ position: "relative" }}>
        <button
          onClick={() => setCalendarOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "6px 13px", background: C.card,
            border: `1px solid ${calendarOpen || isCustom ? C.purple + "80" : C.border}`,
            borderRadius: "8px", cursor: "pointer",
            fontFamily: "Pretendard, Inter, sans-serif", fontSize: "12px",
            color: isCustom ? C.text : C.sub,
            transition: "border-color 0.15s",
            minWidth: isCustom ? "148px" : "auto",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = C.purple + "80")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = calendarOpen || isCustom ? C.purple + "80" : C.border)}
        >
          <Calendar size={12} color={isCustom ? C.purple : C.sub} style={{ flexShrink: 0 }} />

          {isCustom ? (
            /* Custom: show two-line label */
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", textAlign: "left" }}>
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700,
                color: C.purple, letterSpacing: "0.6px", textTransform: "uppercase", lineHeight: 1,
              }}>
                Custom
              </span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: C.text, lineHeight: 1.2 }}>
                {customStartFmt} – {customEndFmt}
              </span>
            </div>
          ) : (
            <span style={{ color: C.text, fontWeight: 400, whiteSpace: "nowrap" }}>
              {activeRange.label}
            </span>
          )}

          <ChevronDown
            size={12}
            color={C.sub}
            style={{ transform: calendarOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
          />
        </button>

        {calendarOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200 }}>
            <CalendarPicker
              initialStart={isCustom ? customRange.start : activeRange.start}
              initialEnd={isCustom ? customRange.end : activeRange.end}
              onApply={(range) => { setCustom(range); setCalendarOpen(false); }}
              onCancel={() => setCalendarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ── Period pills ── */}
      <div
        style={{
          display: "flex", background: C.card,
          border: `1px solid ${C.border}`, borderRadius: "8px",
          padding: "3px", gap: "2px",
        }}
      >
        {PERIODS.map((p) => {
          const isActive = !isCustom && period === p;
          return (
            <button
              key={p}
              onClick={() => { setPeriod(p); setCalendarOpen(false); }}
              style={{
                padding: "5px 12px", borderRadius: "5px", border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: isActive ? 700 : 400,
                background: isActive ? C.tvRed : "transparent",
                color: isActive ? "#FFFFFF" : C.sub,
                transition: "all 0.15s",
                boxShadow: isActive ? `0 0 12px ${C.tvRed}50` : "none",
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = C.text; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.color = C.sub; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; } }}
            >
              {p}
            </button>
          );
        })}

        {/* Custom Range badge — shown when isCustom */}
        {isCustom && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 10px", borderRadius: "5px",
              background: `${C.purple}22`,
              border: `1px solid ${C.purple}50`,
            }}
          >
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700,
              color: C.purple, whiteSpace: "nowrap",
            }}>
              Custom Range
            </span>
            <button
              onClick={() => { clearCustom(); setCalendarOpen(false); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.purple, display: "flex", alignItems: "center",
                padding: "0", lineHeight: 1,
              }}
              title="Custom 기간 해제"
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Export */}
      <button
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "8px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub, transition: "all 0.15s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "#00D2A0"; el.style.color = "#00D2A0"; el.style.boxShadow = "0 0 10px rgba(0,210,160,0.2)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = C.border; el.style.color = C.sub; el.style.boxShadow = "none"; }}
      >
        <Download size={13} /> Export
      </button>

      {/* Notification */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setNotifOpen(v => !v)}
          style={{
            width: "36px", height: "36px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: notifOpen ? "rgba(255,21,60,0.12)" : C.card,
            border: `1px solid ${notifOpen ? "rgba(255,21,60,0.35)" : C.border}`,
            borderRadius: "8px", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { if (!notifOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,21,60,0.35)"; } }}
          onMouseLeave={(e) => { if (!notifOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; } }}
        >
          <Bell size={15} color="#FF153C" strokeWidth={2} />
        </button>

        {/* Unread badge */}
        <div style={{
          position: "absolute", top: "-5px", right: "-5px",
          width: "18px", height: "18px",
          borderRadius: "50%",
          background: "#FF153C",
          border: "2px solid #141428",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "9px", fontWeight: 800,
            color: "#FFFFFF", lineHeight: 1,
          }}>3</span>
        </div>
      </div>

      {/* Avatar */}
      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF 0%, #E30613 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "white", cursor: "pointer", fontFamily: "Inter, sans-serif", flexShrink: 0 }}>
        T
      </div>
    </header>

    {/* ── Notification slide-in panel (portal-like, fixed position) ── */}
    <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

    <style>{`
      @keyframes spin-badge { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
    </>
  );
}