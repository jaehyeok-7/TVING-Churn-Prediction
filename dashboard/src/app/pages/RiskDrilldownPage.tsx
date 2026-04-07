import { useParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { ArrowLeft, Users, Clock, MousePointerClick, TrendingDown, BrainCircuit, ShieldCheck } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useSheetData } from "../contexts/SheetDataContext";

const C = {
  card: "#222B44", border: "#353F66", text: "#FFFFFF",
  sub: "#C4CAE0", muted: "#7880A4",
  tvRed: "#FF153C", purple: "#6C63FF", green: "#00D2A0", orange: "#FFB74D",
  highRisk: "#EF4444", midRisk: "#F59E0B", lowRisk: "#22C55E",
};

// ── 영문 label을 한글로 변경 ──
const BAND_META = {
  high: { label: "고위험군", original: "High Risk", color: C.highRisk, glow: "rgba(239,68,68,0.2)", icon: "🔴", score: "churn_score ≥ 0.7", action: "즉각 개입 필요" },
  mid:  { label: "중위험군", original: "Mid Risk",  color: C.midRisk,  glow: "rgba(245,158,11,0.2)", icon: "🟡", score: "0.4 ≤ churn_score < 0.7", action: "관찰 + 재참여 유도" },
  low:  { label: "저위험군", original: "Low Risk",  color: C.lowRisk,  glow: "rgba(34,197,94,0.2)",  icon: "🟢", score: "churn_score < 0.4", action: "정기 관리" },
};

// 💡 1. 이탈(Churn - High/Mid) 맥락일 때의 변수명 번역
const CHURN_FEATURE_NAMES: Record<string, string> = {
  watch_hours: "총 시청 시간 부족",
  content_diversity_score: "시청 장르 편중 (다양성 부족)",
  price_score: "요금 민감도 상승 (구독료 부담)",
  days_since_last_watch: "접속일 경과 (장기 미접속)",
  completion_rate: "콘텐츠 완주율 하락 (중도 이탈)",
  freq_tv_set: "TV 등 대형화면 시청 안함",
  had_watch_delta_rebuilt: "최근 시청량 급감",
  freq_smartphone: "모바일 앱 접속 감소",
  search_engagement: "검색 후 시청 전환 실패",
  had_core_watch_history_rebuilt: "취향에 맞는 핵심 콘텐츠 부재"
};

// 💡 2. 유지(Retention - Low) 맥락일 때의 변수명 번역
const RETENTION_FEATURE_NAMES: Record<string, string> = {
  watch_hours: "충분한 누적 시청 시간 확보",
  content_diversity_score: "다양한 장르 폭넓게 시청",
  price_score: "요금 대비 만족도 높음 (가성비)",
  days_since_last_watch: "최근까지 꾸준한 접속",
  completion_rate: "콘텐츠 끝까지 정주행 (완주)",
  freq_tv_set: "TV 등 대형화면 시청 환경",
  had_watch_delta_rebuilt: "안정적인 시청량 유지",
  freq_smartphone: "활발한 모바일 앱 탐색",
  search_engagement: "적극적인 콘텐츠 검색 및 시청",
  had_core_watch_history_rebuilt: "확고한 취향(핵심 콘텐츠) 보유"
};

// 💡 3. 현재 뷰(band)에 맞춰 요인명 꺼내오기
const getFeatureName = (key: string, band: string) => {
  if (band === "low") return RETENTION_FEATURE_NAMES[key] || key;
  return CHURN_FEATURE_NAMES[key] || key;
};

// 💡 4. 기획 내용 기반 고/중/저위험군 맞춤형 추천 액션 (각 30개로 대폭 확장!)
const ACTION_MAPS: Record<string, string[]> = {
  high: [
    "구독 일시정지 옵션(1~3개월) 팝업 제공 (해지 버튼 클릭 시 노출)",
    "Persuadables 대상 연간 이용권 파격 특가 팝업 노출",
    "시청 이력 기반 오리지널 최종화 업데이트 긴급 푸시 발송",
    "저가형 요금제(광고형) 연간권 특가 전환 안내 메일 발송",
    "해지 후 7일 차: 미시청 시리즈 결말 유도 (7일 무료 체험) 윈백",
    "해지 후 30일 차: 이달의 신작 라인업 안내 및 첫 달 50% 할인 오퍼",
    "해지 후 60일 차: 맞춤 큐레이션 및 광고형 전환 안내 윈백 이메일",
    "이탈 위험 행동 데이터 기반 'Because You Watched' 맞춤 섹션 노출",
    "요금 부담자 대상 맞춤형 요금제 다운그레이드(스탠다드→광고형) 권유",
    "일시정지 종료 7일 전 복귀 유도 넛지 푸시 ('기다리는 콘텐츠가 있어요')",
    "즉시 전화 상담 및 VIP 전담 매니저 케어 (최상위 VVIP 한정)",
    "타사 OTT 전환 방어용 독점 콘텐츠(KBO 등) 하이라이트 매거진 발송",
    "해지 방어 성공 시 결제일 15일 무료 연장 혜택 제공",
    "웰컴백(Welcome-back) 전용 1개월 무료 시청 쿠폰 SMS 발송",
    "해지 징후 포착 즉시 카카오톡 알림톡으로 시크릿 시청권 발송",
    "장기 미접속자 대상 '딱 10분만 봐도 1,000P 지급' 긴급 미션 부여",
    "해지 사유 설문조사 참여 시 즉시 사용 가능한 티빙 캐시 지급",
    "요금제 해지 페이지 내 '최애 프로그램 새 시즌 예고편' 강제 노출",
    "고객센터 앱 내 채팅을 통한 1:1 구독 유지 설득 및 프로모션 안내",
    "결제 실패(Involuntary Churn) 방지용 카드 변경 리마인드 및 혜택",
    "최근 시청작 원작 웹툰/웹소설(네이버/카카오) 무료 열람 쿠폰 제공",
    "CJ ONE 포인트 연동 구독료 전액 결제 지원 팝업 안내",
    "오프라인 영화 예매권(CGV) 1+1 혜택을 통한 온/오프라인 제휴 락인",
    "이탈 예측 3일 전 '회원님이 좋아할 만한 숨겨진 명작' 이메일 발송",
    "구독 유지 선택 시 다음 달 구독료 30% 페이백 이벤트 알림",
    "가족 결합 할인(프리미엄 요금제 파티원 추가) 팝업 제안",
    "해지 직후 '한 달만 더 유지하면 주어지는 혜택' 리타겟팅 광고 노출",
    "미시청한 역대 티빙 최고 흥행작 1화 SMS 다이렉트 플레이 링크 발송",
    "구독 중단 방지용 '무광고 1주일 체험권' 깜짝 부여 (베이직 유저 대상)",
    "고객센터장 명의의 감사 편지 및 특별 연장 시크릿 오퍼 메일 발송"
  ],
  mid: [
    "관심 구단 KBO/스포츠 생중계 시작 30분 전 개인화 푸시 알림",
    "선호 채널(tvN, JTBC) 인기 프로그램 Quick VOD 등록 긴급 알림",
    "환승연애 등 선호 오리지널 시리즈의 스핀오프/새 시즌 오픈 리마인드",
    "14일 미접속 고객 타겟 '회원님이 즐겨보던 장르 신작 공개' 넛지",
    "시즌 1 완주 후 2주 미접속자 대상 시즌 2 첫 화 바로보기 유도",
    "금요일 18시~자정 주말 정주행 맞춤형 넛지 푸시 (반응률 최고 시간대)",
    "이탈 위험 고객 홈 화면 상단에 '완료율 높은 숏폼/하이라이트' 배치",
    "탐색 피로도(Decision Fatigue) 완화를 위한 다이렉트 플레이 팝업 노출",
    "최근 시청량 급감 유저 대상 '안 본 명작' 장르별 큐레이션 발송",
    "시청 중단작 '이어보기' 푸시 및 관심작 방영일 캘린더 연동 알림",
    "평일 저녁 퇴근 시간대 맞춤형 힐링/예능 콘텐츠 앱 푸시 발송",
    "유사 취향 유저들이 최근 많이 본 'Rising Top 10' 리스트 메일링",
    "특정 배우/감독 신작 공개 시 1순위 알림톡 발송 설정 유도",
    "스마트 TV 연결 가이드 발송으로 대화면(거실) 시청 경험 확장 유도",
    "주말 아침 '이번 주말엔 이 영화 어때요?' 브런치 타임 맞춤 푸시",
    "장르 편식이 심한 유저 대상 타 장르 인기작 교차 추천 (Cross-sell)",
    "시청 중단 지점이 하이라이트 직전일 경우 '결말이 곧 나옵니다' 알림",
    "특정 프로그램 정주행 완료 시 유사 포맷 예능 즉시 자동 재생 세팅",
    "콘텐츠 찜하기(Wishlist) 기능 활성화를 위한 UI 툴팁 강조 노출",
    "월간 시청 기록 리포트 발송 ('이번 달 회원님의 시청 취향 분석')",
    "미사용 티빙 캐시 소멸 임박 안내 및 관련 VOD 시청 독려 메시지",
    "앱 진입 시 최초 화면을 '마지막 시청작' 탭으로 자동 맞춤 세팅",
    "검색창 클릭 시 '지금 가장 핫한 실시간 검색어' 개인화하여 노출",
    "기존 시청 시간대 변동 감지 시, 새로운 시간대에 맞춘 푸시 발송",
    "관심 있는 예능의 미공개 비하인드 영상 독점 링크 SMS 발송",
    "몰아보기(Binge-watching) 특화 UI/UX 임시 적용 팝업 노출",
    "시청 후기 및 별점 최초 작성 시 다음 달 구독료 할인 쿠폰 즉시 지급",
    "21일 미접속 시 '최근 업데이트된 오리지널 요약본' 5분 영상 발송",
    "홈 화면 첫 번째 배너를 고객 이름이 포함된 개인화 환영 배너로 변경",
    "오디오 모드(라디오처럼 듣기) 활용 가이드 발송으로 틈새 시간 공략"
  ],
  low: [
    "시청 챌린지 뱃지 시스템 도입 ('이번 주 3편 시청 시 300P 적립')",
    "콘텐츠 시청 중 티빙톡(실시간 채팅) 참여 유도로 '연결되는 공간' 경험 제공",
    "엔딩 크레딧 시점 스핀오프/관련 작 자동 재생으로 Hit-and-run 완벽 방어",
    "월간 시청 랭킹 연동 및 오리지널 팝업스토어/굿즈 응모권 최우선 부여",
    "출연진 팬미팅 및 오프라인 이벤트 추첨 응모 기회 제공 (로열티 강화)",
    "정주행러 대상 하이엔드(Premium) 요금제 업셀링 캠페인 프로모션",
    "가족/지인 프로필 추가 공유 권유 및 프로필 커스터마이징 툴 안내",
    "시청 기록 기반 맞춤형 썸네일 적용 (예: 액션 선호자에게 액션 썸네일 노출)",
    "팬덤 커뮤니티 투표 기능 알림 및 리뷰 연속 작성 시 리워드 포인트 지급",
    "TV/태블릿 등 대형 디바이스 연동 가이드 안내로 다중 시청 환경 조성",
    "연간권 전환 시 CJ ONE 포인트 추가 적립 프로모션 팝업 안내",
    "최상위 VIP 전용 '티빙 오리지널 한정판 대본집' 굿즈 증정 이벤트",
    "1년 이상 유지 고객 대상 'N주년 감사 맞춤형 VOD 영화 쿠폰' 지급",
    "신규 기능(예: 워치파티, 배속 재생) 런칭 시 베타 테스터 우선 초대",
    "KBO 생중계 응원 구단 설정 유도 및 맞춤형 전용 응원 이모티콘 지급",
    "내가 본 콘텐츠의 감독/배우가 참여하는 실시간 온라인 GV/라이브 초대",
    "나만의 시청 기록을 인스타그램에 공유할 수 있는 예쁜 이미지 템플릿 제공",
    "주말 연속 시청 시 '정주행 마스터' 칭호 및 앱 내 프로필 특별 효과 부여",
    "티빙 메인 화면 테마(다크/라이트, 전용 폰트) 커스텀 권한 VIP 제공",
    "다음 달 개봉 예정 오리지널 작품 선공개 1화 VIP 사전 시청권 발송",
    "오프라인 팝업스토어 프리패스(대기 없는 하이패스 입장) 혜택 제공",
    "KBO 포스트시즌 등 스포츠 빅매치 오프라인 티켓 우선 예매권 추첨",
    "취향이 비슷한 유저들끼리 연결해주는 '추천 플레이리스트 공유' 탭 오픈",
    "장기 결제자 대상 결제일 당일 깜짝 기프티콘(커피/간식 등) 증정",
    "프리미엄 요금제 가족 계정 관리 가이드 발송 및 동시 시청 적극 독려",
    "오리지널 예능 시청 중 퀴즈 팝업을 통한 즉석 경품 룰렛 이벤트 진행",
    "가장 시청 시간이 높은 요일/시간대에 맞춰 서프라이즈 랜덤 알림 발송",
    "고객이 직접 투표 참여하는 '다음 오리지널 제작 아이디어' 설문 오픈",
    "우수 리뷰어로 선정 시 메인 화면에 리뷰 노출 및 크레딧 닉네임 표기",
    "콘텐츠 릴레이 시청 시 시청 시간만큼 기부되는 참여형 CSR 캠페인 유도"
  ]
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1C2333", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 3px" }}>{label}</p>
      {/* 4,056명 형태로 표기 */}
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: C.tvRed, margin: 0 }}>
        {payload[0].value.toLocaleString()}명
      </p>
    </div>
  );
};

function scoreColor(s: number): string {
  if (s >= 0.8) return C.highRisk;
  if (s >= 0.7) return C.midRisk;
  return "#FFE66D";
}

export function RiskDrilldownPage() {
  const { band = "high" } = useParams<{ band: string }>();
  const navigate = useNavigate();
  const meta = BAND_META[band as keyof typeof BAND_META] ?? BAND_META.high;

  // 💡 shap 데이터 꺼내오기 추가
  const { users: allRealUsers, shapHigh, shapMid, shapLow } = useSheetData() as any;

  const users = useMemo(() =>
    allRealUsers
      .filter((u: any) => u.risk_band === meta.original) // 데이터 필터링은 기존 영문 유지
      .sort((a: any, b: any) => b.churn_score - a.churn_score),
    [allRealUsers, meta.original]
  );

  const avgScore      = users.length ? (users.reduce((s: number, u: any) => s + u.churn_score, 0) / users.length).toFixed(2) : "0.00";
  const avgWatch      = users.length ? Math.round(users.reduce((s: number, u: any) => s + u.watch_time, 0) / users.length) : 0;
  const avgCompletion = users.length
    ? Math.round(users.filter((u: any) => u.completion_rate != null).reduce((s: number, u: any) => s + (u.completion_rate ?? 0), 0) / users.length * 100)
    : 0;
  const activeDayUsers = users.filter((u: any) => u.last_active_days !== null);
  const avgActiveDays = activeDayUsers.length
    ? Math.round(activeDayUsers.reduce((s: number, u: any) => s + (u.last_active_days as number), 0) / activeDayUsers.length)
    : 0;

  const deviceDist = ["Mobile","TV","Web","Tablet"].map(d => ({
    device: d,
    count: users.filter((u: any) => u.device === d).length,
  })).filter(d => d.count > 0);

  const watchBins = [
    { label: "0~5시간",   count: users.filter((u: any) => u.watch_time < 5).length  },
    { label: "5~15시간",  count: users.filter((u: any) => u.watch_time >= 5 && u.watch_time < 15).length },
    { label: "15~30시간", count: users.filter((u: any) => u.watch_time >= 15 && u.watch_time < 30).length},
    { label: "30시간+",   count: users.filter((u: any) => u.watch_time >= 30).length  },
  ];

  // 현재 위험군에 맞는 확장된 추천 액션 배열 가져오기
  const currentActionMap = ACTION_MAPS[band] || ACTION_MAPS.high;

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => navigate("/churn-risk")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: C.sub, fontFamily: "Pretendard, sans-serif", fontSize: "12px", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = meta.color; (e.currentTarget as HTMLButtonElement).style.color = meta.color; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.sub; }}
        >
          <ArrowLeft size={13} /> 이탈 위험 분석
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.muted }}>/</span>
        <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", fontWeight: 600, color: meta.color }}>
          {meta.icon} {meta.label} 상세보기
        </span>
      </div>

      {/* ── Header card ── */}
      <div style={{ background: C.card, border: `1px solid ${meta.color}30`, borderRadius: "12px", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: meta.glow, filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "28px" }}>{meta.icon}</span>
              <div>
                <h2 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "22px", fontWeight: 900, color: meta.color, margin: 0, letterSpacing: "-0.5px" }}>{meta.label}</h2>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: "3px 0 0" }}>{meta.score}</p>
              </div>
            </div>
            <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.sub, margin: 0 }}>
              권장 대응: <strong style={{ color: meta.color }}>{meta.action}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "48px", fontWeight: 900, color: meta.color, lineHeight: 1, letterSpacing: "-2px" }}>{users.length.toLocaleString()}</div>
            <div style={{ fontFamily: "Pretendard, sans-serif", fontSize: "13px", color: C.sub }}>해당 위험군 사용자 수</div>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {[
          { icon: Users,            label: "평균 Churn Score", value: avgScore,                unit: "",   color: meta.color   },
          { icon: Clock,            label: "평균 시청 시간",    value: `${avgWatch}`,            unit: "시간", color: C.purple     },
          { icon: MousePointerClick,label: "평균 비활성 기간",  value: `${avgActiveDays}`,       unit: "일", color: C.orange     },
          { icon: TrendingDown,     label: "평균 완료율",       value: `${avgCompletion}`,       unit: "%",  color: C.green      },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${k.color}18`, border: `1px solid ${k.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={k.color} />
              </div>
              <div>
                <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub, margin: "0 0 4px" }}>{k.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 800, color: k.color, letterSpacing: "-0.5px" }}>{k.value}</span>
                  <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub }}>{k.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px" }}>
        
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>디바이스 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deviceDist} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.16)" vertical={false} />
              <XAxis dataKey="device" tick={{ fill: C.sub, fontSize: 11, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{fill: 'transparent'}} wrapperStyle={{zIndex: 1000}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={meta.color} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>시청 시간 분포</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={watchBins} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.sub, fontSize: 10, fontFamily: "Inter, sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{fill: 'transparent'}} wrapperStyle={{zIndex: 1000}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {watchBins.map((_, i) => <Cell key={`watch-${i}`} fill={i === 0 ? meta.color : C.purple} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>
              {band === 'low' ? '잔류 유지 핵심 요인' : '이탈 발생 핵심 요인'}
            </h3>
            <span style={{ fontSize: "10px", padding: "2px 6px", background: `${meta.color}15`, color: meta.color, borderRadius: "4px", fontWeight: 600 }}>SHAP Local</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
            {(() => {
              const targetShapData = 
                band === 'high' ? shapHigh :
                band === 'mid' ? shapMid :
                shapLow;

              if (!targetShapData || targetShapData.length === 0) {
                 return <div style={{ color: C.muted, fontSize: "12px", textAlign: "center", marginTop: "40px" }}>데이터를 불러오는 중입니다.</div>;
              }

              const maxVal = Math.max(...targetShapData.map((d: any) => d.score || d.mean_abs_shap || 0.001), 0.001);

              return targetShapData.slice(0, 5).map((f: any, idx: number) => {
                const score = f.score || f.mean_abs_shap || 0;
                const pct = (score / maxVal) * 100;
                const alpha = Math.round((1 - idx * 0.1) * 255).toString(16).padStart(2, "0");
                const labelName = getFeatureName(f.feature, band);

                return (
                  <div key={f.feature}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.text, fontWeight: 500 }}>
                        {labelName}
                      </span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: meta.color }}>
                        {score.toFixed(3)}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#2A2A3A", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${meta.color}${alpha}, ${meta.color}80)`, borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* ── User table ── */}
      <div style={{ background: C.card, border: `1px solid ${meta.color}25`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: "Pretendard, sans-serif", fontSize: "15px", fontWeight: 700, color: C.text, margin: "0 0 3px" }}>
            {meta.label} 전체 사용자 목록
          </h3>
          <p style={{ fontFamily: "Pretendard, sans-serif", fontSize: "12px", color: C.sub, margin: 0 }}>
            Churn Score 내림차순 · {users.length.toLocaleString()}명 (화면 성능을 위해 100명만 표시)
          </p>
        </div>
        <div style={{ overflowX: "auto", maxHeight: "500px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1, background: C.card }}>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["사용자 ID", "Churn Score", "Device", "Segment", "시청(시간)", "휴면(일)", "완료율", "추천 액션"].map(h => (
                  <th key={h} style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2px", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 100).map((u: any, i: number) => {
                const sc = scoreColor(u.churn_score);
                
                let korSegment = u.segment ?? u.segment_volume ?? "-";
                if (korSegment.toLowerCase().includes("heavy") || korSegment.toLowerCase().includes("power")) korSegment = "정주행러";
                else if (korSegment.toLowerCase().includes("medium") || korSegment.toLowerCase().includes("regular")) korSegment = "일상러";
                else if (korSegment.toLowerCase().includes("light") || korSegment.toLowerCase().includes("low")) korSegment = "찍먹러";

                return (
                  <tr
                    key={u.user_id}
                    style={{ borderBottom: i < Math.min(users.length, 100) - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.text, fontWeight: 700 }}>{u.user_id}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${u.churn_score * 100}%`, height: "100%", background: sc, borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: sc }}>{u.churn_score.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.purple }}>{u.device}</span>
                    </td>
                    <td style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: C.sub }}>{korSegment}</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: C.sub }}>{u.watch_time.toLocaleString()}시간</td>
                    <td style={{ padding: "11px 18px", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: u.last_active_days === null ? C.highRisk : (u.last_active_days ?? 0) >= 30 ? C.highRisk : (u.last_active_days ?? 0) >= 10 ? C.midRisk : C.sub }}>
                      {u.last_active_days === null ? "미접속" : `${u.last_active_days.toLocaleString()}일`}
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "44px", height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${((u.completion_rate ?? 0) * 100)}%`, height: "100%", background: C.purple, borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: C.sub }}>
                          {((u.completion_rate ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    {/* 💡 확장된 추천 액션을 표에 표시 */}
                    <td style={{ padding: "11px 18px", fontFamily: "Pretendard, sans-serif", fontSize: "11px", color: meta.color, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {currentActionMap[i % currentActionMap.length]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
}