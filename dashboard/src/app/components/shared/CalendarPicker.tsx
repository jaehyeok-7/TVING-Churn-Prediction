import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const C = {
  bg:     "#191929",
  card:   "#222B44",
  border: "#353F66",
  text:   "#FFFFFF",
  sub:    "#C4CAE0",
  muted:  "#7880A4",
  tvRed:  "#FF153C",
  purple: "#6C63FF",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseDateStr(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}
function compareDateStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

interface Props {
  initialStart: string;
  initialEnd:   string;
  onApply:  (range: { start: string; end: string }) => void;
  onCancel: () => void;
}

export function CalendarPicker({ initialStart, initialEnd, onApply, onCancel }: Props) {
  const [sy, sm] = parseDateStr(initialStart);
  const [viewYear,  setViewYear]  = useState(sy);
  const [viewMonth, setViewMonth] = useState(sm);

  const [start,    setStart]    = useState<string | null>(initialStart);
  const [end,      setEnd]      = useState<string | null>(initialEnd);
  const [hovering, setHovering] = useState<string | null>(null);

  /* Days grid for a month */
  function getDays(y: number, m: number) {
    const firstDay  = new Date(y, m, 1).getDay();
    const daysInMo  = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMo; d++) cells.push(d);
    return cells;
  }

  const days = getDays(viewYear, viewMonth);

  // ⭐ 추가된 핵심 로직: 2025년 밖으로 못 나가게 막는 조건
  const canGoPrev = viewYear > 2025 || (viewYear === 2025 && viewMonth > 0);
  const canGoNext = viewYear < 2025 || (viewYear === 2025 && viewMonth < 11);

  const prevMonth = () => {
    if (!canGoPrev) return; // 2025년 1월 이전으로 못 넘어가게 차단
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (!canGoNext) return; // 2025년 12월 이후로 못 넘어가게 차단
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (d: number) => {
    // 혹시라도 2025년이 아닌 날짜가 클릭되는 것을 방지
    if (viewYear !== 2025) return;

    const ds = toDateStr(viewYear, viewMonth, d);
    if (!start || (start && end)) {
      setStart(ds); setEnd(null); setHovering(null);
    } else {
      if (compareDateStr(ds, start) < 0) { setEnd(start); setStart(ds); }
      else setEnd(ds);
    }
  };

  const inRange = (ds: string) => {
    if (!start) return false;
    const effectiveEnd = end ?? hovering;
    if (!effectiveEnd) return ds === start;
    const lo = compareDateStr(start, effectiveEnd) <= 0 ? start : effectiveEnd;
    const hi = compareDateStr(start, effectiveEnd) <= 0 ? effectiveEnd : start;
    return compareDateStr(ds, lo) >= 0 && compareDateStr(ds, hi) <= 0;
  };

  const isStart = (ds: string) => ds === start;
  const isEnd   = (ds: string) => ds === end;

  const canApply = !!start && !!end;

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "20px",
        width: "300px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        {/* ⭐ 이전 버튼: 2025년 1월이면 반투명해지고 클릭 불가능하게 변경 */}
        <button 
          onClick={prevMonth} 
          disabled={!canGoPrev}
          style={{ background: "none", border: "none", cursor: canGoPrev ? "pointer" : "not-allowed", color: C.sub, display: "flex", padding: "4px", opacity: canGoPrev ? 1 : 0.2 }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: C.text }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        {/* ⭐ 다음 버튼: 2025년 12월이면 반투명해지고 클릭 불가능하게 변경 */}
        <button 
          onClick={nextMonth} 
          disabled={!canGoNext}
          style={{ background: "none", border: "none", cursor: canGoNext ? "pointer" : "not-allowed", color: C.sub, display: "flex", padding: "4px", opacity: canGoNext ? 1 : 0.2 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "6px" }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, color: C.muted, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const ds        = toDateStr(viewYear, viewMonth, d);
          const isS       = isStart(ds);
          const isE       = isEnd(ds);
          const inR       = inRange(ds);
          const isEndpoint = isS || isE;
          const isOutOfRange = viewYear !== 2025; // 2025년이 아니면 날짜 클릭 차단

          return (
            <button
              key={ds}
              onClick={() => handleDayClick(d)}
              onMouseEnter={() => { if (start && !end) setHovering(ds); }}
              onMouseLeave={() => setHovering(null)}
              disabled={isOutOfRange}
              style={{
                padding: "6px 2px",
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: isEndpoint ? 700 : 400,
                color: isOutOfRange ? C.border : (isEndpoint ? "#fff" : inR ? C.text : C.sub),
                background: isEndpoint
                  ? C.tvRed
                  : inR
                  ? `rgba(255,21,60,0.18)`
                  : "transparent",
                border: "none",
                borderRadius: isEndpoint ? "6px" : "4px",
                cursor: isOutOfRange ? "not-allowed" : "pointer",
                transition: "all 0.1s",
                opacity: isOutOfRange ? 0.3 : 1
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Selected range display */}
      <div style={{ marginTop: "14px", padding: "8px 12px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: start ? C.text : C.muted }}>
          {start ?? "시작일"}
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.muted }}>→</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: end ? C.text : C.muted }}>
          {end ?? "종료일"}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: "8px", cursor: "pointer", fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#B8BDD6"; (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.sub; }}
        >
          취소
        </button>
        <button
          onClick={() => canApply && onApply({ start: start!, end: end! })}
          disabled={!canApply}
          style={{ flex: 2, padding: "8px", background: canApply ? C.tvRed : C.muted, border: "none", borderRadius: "8px", cursor: canApply ? "pointer" : "not-allowed", fontFamily: "Pretendard, sans-serif", fontSize: "12px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", opacity: canApply ? 1 : 0.5 }}
        >
          <Check size={12} /> 적용
        </button>
      </div>
    </div>
  );
}