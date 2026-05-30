import { useState, useEffect } from "react";

const API_BASE = "https://subway-congestion-api.onrender.com";
const ROUTE_API_BASE = "https://yeoyuro-backend.onrender.com";

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router";
import { Search, User, MapPin, Navigation, TrendingDown, Home, Map, X, Check } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => { onComplete(); }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="size-full relative flex items-center justify-center overflow-hidden">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1763462929966-23955f0a8a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
        alt="지도 배경"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">여유로</h1>
        <p className="text-xl text-white/90">혼잡도를 고려한 스마트 경로 안내</p>
      </div>
    </div>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");

  const handleSearch = () => {
    if (departure && arrival) {
      onClose();
      navigate("/routes", { state: { departure, arrival } });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">경로 검색</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="출발지 입력"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            autoFocus
          />
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Navigation className="w-5 h-5 text-red-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="도착지 입력"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!departure || !arrival}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          <Search className="w-5 h-5 inline-block mr-2" />
          경로 검색
        </button>
      </div>
    </div>
  );
}

function MainScreen() {
  const [activeTab, setActiveTab] = useState<"myTransit" | "congestion">("myTransit");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  const tips = [
    { type: "공지", emoji: "📢", text: "러시아워 경로 추천 기능이 곧 추가됩니다!" },
    { type: "팁", emoji: "💡", text: "출퇴근 시간대엔 전 정거장 탑승으로 자리를 확보하세요" },
    { type: "팁", emoji: "🚌", text: "광역버스 혼잡도는 실시간으로 반영됩니다" },
    { type: "팁", emoji: "⏱️", text: "혼잡도 반영 경로는 기본 경로보다 쾌적하게 이동할 수 있어요" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIdx(prev => (prev + 1) % tips.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="size-full relative flex flex-col overflow-hidden">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1767873691315-c9e61c705b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
        alt="지도 배경"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("myTransit")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "myTransit" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            마이교통
          </button>
          <button
            onClick={() => setActiveTab("congestion")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "congestion" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            실시간혼잡도
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-500 ${
                    idx === currentTipIdx ? "block" : "hidden"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                      tip.type === "공지" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {tip.type}
                    </span>
                    <span className="text-sm text-gray-700">{tip.text}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-center gap-1.5 pb-2">
                {tips.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTipIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentTipIdx ? "bg-blue-600 w-3" : "bg-gray-300 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3">
            {activeTab === "myTransit" && <MyTransitTab />}
            {activeTab === "congestion" && <CongestionTab />}
          </div>
        </div>
      </div>

      {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}
      <BottomNavigation onSearchClick={() => setShowSearchModal(true)} />
    </div>
  );
}

function MyTransitTab() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">자주 가는 경로</h2>
      <div className="bg-white rounded-xl p-8 shadow-md text-center text-gray-400">
        <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">아직 이용한 경로가 없어요</p>
        <p className="text-sm mt-1">경로를 검색하면 여기에 표시됩니다</p>
      </div>
    </div>
  );
}

function CongestionTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLine, setSelectedLine] = useState("");
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes() >= 30 ? "30분" : "00분";
  const currentTimeLabel = `${currentHour}시${currentMinutes}`;
  const dayOfWeek = now.getDay();
  const dayType = dayOfWeek === 0 ? "일요일" : dayOfWeek === 6 ? "토요일" : "평일";
  const lines = ["1호선","2호선","3호선","4호선","5호선","6호선","7호선","8호선"];

  useEffect(() => {
    fetch(`${API_BASE}/congestion`)
      .then(res => {
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setAllData(list);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = allData.filter(item => {
    const matchTime = item["시간대"] === currentTimeLabel;
    const matchDay = item["요일구분"] === dayType;
    const matchLine = !selectedLine || item["호선"] === selectedLine;
    const matchStation = !searchQuery || item["출발역"]?.includes(searchQuery.replace("역", ""));
    return matchTime && matchDay && matchLine && matchStation;
  });

  const getCongestionColor = (value: number) => {
    if (value >= 80) return { badge: "bg-red-100 text-red-700", bar: "bg-red-500", label: "혼잡" };
    if (value >= 30) return { badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500", label: "보통" };
    return { badge: "bg-green-100 text-green-700", bar: "bg-green-500", label: "쾌적" };
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">실시간 혼잡도</h2>
        <span className="text-sm text-gray-500">{currentTimeLabel} ({dayType})</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedLine("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedLine === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          전체
        </button>
        {lines.map((line, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedLine(line)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedLine === line ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {line}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl p-3 shadow-md flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="역 이름 검색 (예: 강남)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>
      <p className="text-xs text-gray-400">현재 시간({currentTimeLabel}, {dayType}) 기준 혼잡도입니다</p>
      {loading && <div className="text-center py-10 text-gray-500">혼잡도 데이터 불러오는 중...</div>}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length > 0 ? filtered.map((item: any, idx: number) => {
            const percentage = Number(item["혼잡도"] ?? 0);
            const congestion = getCongestionColor(percentage);
            const displayPercent = Math.min(Math.round(percentage), 100);
            return (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-gray-800">{item["출발역"]}역</span>
                    <span className="ml-2 text-sm text-gray-500">{item["호선"]} {item["상하구분"]}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${congestion.badge}`}>
                    {congestion.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${congestion.bar}`} style={{ width: `${displayPercent}%` }} />
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">혼잡도 {percentage}</div>
              </div>
            );
          }) : (
            <div className="text-center py-10 text-gray-400">
              {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "현재 시간대 데이터가 없습니다."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BottomNavigation({ onSearchClick }: { onSearchClick?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative z-10 bg-white border-t border-gray-200 flex items-center justify-around px-4 pt-3 pb-4">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs">홈</span>
      </button>
      <button
        onClick={onSearchClick ?? (() => navigate("/"))}
        className="-mt-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <Search className="w-6 h-6" />
      </button>
      <button
        onClick={() => navigate("/account")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/account") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
      >
        <User className="w-6 h-6" />
        <span className="text-xs">계정</span>
      </button>
    </div>
  );
}

function RouteResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { departure, arrival } = (location.state as { departure: string; arrival: string }) || {};

  const [routes, setRoutes] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!departure || !arrival) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const jsDay = now.getDay();
    const currentWeekday = jsDay === 0 ? 6 : jsDay - 1;

    fetch(`${ROUTE_API_BASE}/api/routes?start=${encodeURIComponent(departure)}&end=${encodeURIComponent(arrival)}&hour=${currentHour}&minute=${currentMinute}&weekday=${currentWeekday}`)
      .then(res => {
        if (!res.ok) throw new Error("경로를 불러오지 못했습니다.");
        return res.json();
      })
      .then(result => {
        if (result.status === "fail") {
          throw new Error(result.message || "위치를 지도에서 찾을 수 없습니다.");
        }
        setData(result);
        const list = Array.isArray(result) ? result : result.routes ?? [];
        setRoutes(list.slice(0, 10));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [departure, arrival]);

  const currentRoute = routes[selectedIdx];
  const isRushHour = data?.is_rush_hour;

  // ✅ 경로 라벨: 러시아워면 AI 러시아워 1/2/3, 나머지는 일반 경로
  const getRouteLabel = (idx: number) => {
    if (isRushHour && idx < 3) return `AI 러시아워 ${idx + 1}`;
    const generalIdx = isRushHour ? idx - 3 + 1 : idx + 1;
    return `일반 경로 ${generalIdx}`;
  };

  const getTimeDiff = (route: any) => {
    if (!route) return null;
    const diff = route.estimated_comfort_time_min - route.original_time_min;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}분` : `${diff}분`;
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold mb-3">
          ← 돌아가기
        </button>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{departure}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Navigation className="w-4 h-4 text-red-600" />
            <span className="font-medium">{arrival}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500">경로를 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <p className="text-red-500 font-semibold">{error}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold">
              돌아가기
            </button>
          </div>
        </div>
      )}

      {!loading && !error && routes.length > 0 && currentRoute && (
        <>
          <div className="flex gap-2 p-3 bg-white border-b border-gray-200 overflow-x-auto">
            {routes.map((route, idx) => {
              const isAI = isRushHour && idx < 3;
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? isAI
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-blue-600 text-white border-blue-600"
                      : isAI
                        ? "bg-orange-50 text-orange-700 border-orange-300 hover:border-orange-400"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-xs font-bold mb-1">
                    {isAI ? "🤖 " : ""}{getRouteLabel(idx)}
                  </div>
                  <div className="text-sm opacity-90">{route.estimated_comfort_time_min}분</div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className={`bg-white rounded-xl p-4 shadow-md border-2 ${
              isRushHour && selectedIdx < 3 ? "border-orange-300" : "border-blue-200"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">{getRouteLabel(selectedIdx)}</h3>
                {isRushHour && selectedIdx < 3 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                    🤖 AI 추천
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{currentRoute.estimated_comfort_time_min}분</div>
                  <div className="text-xs text-gray-500">예상 소요시간</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">{currentRoute.original_time_min}분</div>
                  <div className="text-xs text-gray-500">기본 소요시간</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">{currentRoute.payment_krw?.toLocaleString()}원</div>
                  <div className="text-xs text-gray-500">요금</div>
                </div>
              </div>

              {getTimeDiff(currentRoute) && (
                <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 text-center mb-4">
                  기본 경로 대비 {getTimeDiff(currentRoute)} 소요
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-4">
                {currentRoute.sub_paths && currentRoute.sub_paths.length > 0 ? (
                  currentRoute.sub_paths.map((sub: any, sIdx: number) => (
                    <div key={sIdx} className="flex flex-col">
                      <div className="flex items-start gap-3">
                        <div className={`w-16 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          sub.traffic_type === 1 ? "bg-green-100 text-green-700" :
                          sub.traffic_type === 2 ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {sub.traffic_type === 1 ? "지하철" : sub.traffic_type === 2 ? "버스" : "도보"}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="font-semibold text-gray-800 text-sm">
                            {sub.traffic_type === 3 ? "도보 이동" : `${sub.start_name} ➡️ ${sub.end_name}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {sub.traffic_type !== 3 && sub.lane_name && (
                              <span className="font-medium text-gray-700 mr-2">[{sub.lane_name}]</span>
                            )}
                            <span>{sub.section_time_min}분 소요</span>
                            {sub.station_count > 0 && <span> ({sub.station_count}개 정거장)</span>}
                          </div>
                        </div>
                      </div>
                      {sIdx < currentRoute.sub_paths.length - 1 && (
                        <div className="w-0.5 h-4 bg-gray-200 ml-8 my-1" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">출</div>
                      <div>
                        <div className="font-semibold text-gray-800">{currentRoute.first_start_station || departure}</div>
                        <div className="text-xs text-gray-500">출발역</div>
                      </div>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-300 ml-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm">도</div>
                      <div>
                        <div className="font-semibold text-gray-800">{currentRoute.last_end_station || arrival}역</div>
                        <div className="text-xs text-gray-500">도착역</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ 러시아워 Gemini 분석 카드 */}
            {isRushHour && selectedIdx < 3 && data?.rush_hour_result ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">AI 러시아워 분석</h4>
                    <p className="text-sm text-orange-800 mb-2 leading-relaxed">
                      {data.rush_hour_result.rush_hour_tip}
                    </p>
                    {data.rush_hour_result.alternative && (
                      <div className="bg-orange-100 rounded-lg px-3 py-2 text-sm text-orange-700">
                        💡 {data.rush_hour_result.alternative}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isRushHour && selectedIdx >= 3 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">일반 경로</h4>
                    <p className="text-sm text-gray-600">
                      AI 추천 없이 ODsay 기본 경로입니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">혼잡도 정보</h4>
                    <p className="text-sm text-blue-800">현재는 러시아워 시간대가 아닙니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-t border-gray-200 p-4">
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              출발하기
            </button>
          </div>
        </>
      )}

      {!loading && !error && (routes.length === 0 || !currentRoute) && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <p className="text-gray-500">검색된 경로가 없습니다.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold">
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SignupScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "", phone: "", email: "" });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const handleCheckUsername = () => {
    if (!formData.username) return;
    setIsCheckingUsername(true);
    setTimeout(() => {
      setUsernameAvailable(Math.random() > 0.5);
      setIsCheckingUsername(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.password || !formData.phone || !formData.email) { alert("모든 항목을 입력해주세요."); return; }
    if (formData.password !== formData.confirmPassword) { alert("비밀번호가 일치하지 않습니다."); return; }
    if (!usernameAvailable) { alert("아이디 중복확인을 해주세요."); return; }
    alert("회원가입이 완료되었습니다!");
    navigate("/");
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-blue-600"><X className="w-6 h-6" /></button>
        <h1 className="text-xl font-bold text-gray-800">회원가입</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
          <div className="flex gap-2">
            <input type="text" value={formData.username} onChange={(e) => { setFormData({ ...formData, username: e.target.value }); setUsernameAvailable(null); }} placeholder="아이디 입력" className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
            <button onClick={handleCheckUsername} disabled={!formData.username || isCheckingUsername} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-gray-300 hover:bg-blue-700 transition-colors whitespace-nowrap">
              {isCheckingUsername ? "확인중..." : "중복확인"}
            </button>
          </div>
          {usernameAvailable !== null && (
            <div className={`mt-2 text-sm flex items-center gap-1 ${usernameAvailable ? "text-green-600" : "text-red-600"}`}>
              {usernameAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              <span>{usernameAvailable ? "사용 가능한 아이디입니다" : "이미 사용중인 아이디입니다"}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="비밀번호 입력" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
          <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="비밀번호 재입력" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-1"><X className="w-4 h-4" /><span>비밀번호가 일치하지 않습니다</span></div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="010-1234-5678" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500" />
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 p-4">
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">가입하기</button>
      </div>
    </div>
  );
}

function MapScreen() {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800">지도</h1>
      </div>
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">지도 화면</p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

function AccountScreen() {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800">내 계정</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">사용자 이름</h2>
          <p className="text-sm text-gray-600 mt-1">user@example.com</p>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <button className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100"><span className="text-gray-800 font-medium">프로필 수정</span></button>
          <button className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100"><span className="text-gray-800 font-medium">알림 설정</span></button>
          <button className="w-full p-4 text-left hover:bg-gray-50"><span className="text-gray-800 font-medium">로그아웃</span></button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) setIsFirstVisit(false);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (isFirstVisit) setShowSignupPrompt(true);
  };

  const handleSignupResponse = (wantsSignup: boolean) => {
    setShowSignupPrompt(false);
    localStorage.setItem("hasVisited", "true");
    setIsFirstVisit(false);
    if (wantsSignup) navigate("/signup");
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/routes" element={<RouteResultScreen />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/account" element={<AccountScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
      </Routes>

      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-800 text-center">환영합니다!</h3>
            <p className="text-center text-gray-700">처음 이용하신다면 회원가입을 진행하시겠어요?</p>
            <div className="flex gap-3">
              <button onClick={() => handleSignupResponse(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">아니요</button>
              <button onClick={() => handleSignupResponse(true)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">네</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="size-full">
        <AppContent />
      </div>
    </Router>
  );
}