import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router";
import { Search, User, History, MapPin, Navigation, Clock, Zap, TrendingDown, Home, Map, Star, Train, Bus, Car, X, Check } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

const API_BASE = "https://subway-congestion-api.onrender.com";

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
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

function MainScreen() {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [activeTab, setActiveTab] = useState<"main" | "myTransit" | "favorites" | "congestion">("main");

  const handleSearch = () => {
    if (departure && arrival) {
      navigate("/routes", { state: { departure, arrival } });
    }
  };

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
            onClick={() => setActiveTab("favorites")}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "favorites" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            즐겨찾기
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
          {activeTab === "main" && (
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <input
                    type="text"
                    placeholder="출발지 입력"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Navigation className="w-5 h-5 text-red-600" />
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
          )}

          {activeTab === "myTransit" && <MyTransitTab />}
          {activeTab === "favorites" && <FavoritesTab setDeparture={setDeparture} setArrival={setArrival} setActiveTab={setActiveTab} />}
          {activeTab === "congestion" && <CongestionTab />}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function MyTransitTab() {
  const frequentRoutes = [
    { from: "강남역", to: "홍대입구역", count: 15, lastUsed: "오늘 오전 8:30" },
    { from: "서울역", to: "잠실역", count: 8, lastUsed: "어제 오후 6:15" },
    { from: "신촌역", to: "강남역", count: 5, lastUsed: "3일 전" }
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">자주 가는 경로</h2>
      <div className="space-y-3">
        {frequentRoutes.map((route, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{route.from}</span>
                <span className="text-gray-400">→</span>
                <Navigation className="w-4 h-4 text-red-600" />
                <span className="font-semibold">{route.to}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{route.count}회 이용</span>
              <span>•</span>
              <span>마지막 이용: {route.lastUsed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoritesTab({ setDeparture, setArrival, setActiveTab }: {
  setDeparture: (v: string) => void;
  setArrival: (v: string) => void;
  setActiveTab: (v: "main" | "myTransit" | "favorites" | "congestion") => void;
}) {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const favorites = [
    { name: "홍대입구역", address: "서울 마포구 양화로 160", lat: 37.5579, lng: 126.9239 },
    { name: "강남역", address: "서울 강남구 강남대로 396", lat: 37.4979, lng: 127.0276 },
    { name: "서울역", address: "서울 용산구 한강대로 405", lat: 37.5547, lng: 126.9707 }
  ];

  const handlePlaceClick = (place: typeof favorites[0]) => {
    setSelectedPlace(place.name);
    setShowLocationPopup(true);
  };

  const handleSetLocation = (type: "departure" | "arrival") => {
    if (selectedPlace) {
      if (type === "departure") {
        setDeparture(selectedPlace);
      } else {
        setArrival(selectedPlace);
      }
      setShowLocationPopup(false);
      setActiveTab("main");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">즐겨찾기</h2>
      <div className="space-y-3">
        {favorites.map((place, idx) => (
          <div
            key={idx}
            onClick={() => handlePlaceClick(place)}
            className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{place.name}</h3>
                <p className="text-sm text-gray-600">{place.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{selectedPlace}</h3>
              <button onClick={() => setShowLocationPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 h-48 flex items-center justify-center">
              <Map className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">지도 위치 표시</span>
            </div>

            <p className="text-center text-gray-700 font-semibold">출발지 또는 도착지로 설정하시겠습니까?</p>

            <div className="flex gap-3">
              <button
                onClick={() => handleSetLocation("departure")}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                출발지로 설정
              </button>
              <button
                onClick={() => handleSetLocation("arrival")}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                도착지로 설정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CongestionTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [congestionData, setCongestionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/congestion/summary`)
      .then(res => {
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        return res.json();
      })
      .then(data => {
        setCongestionData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getCongestionColor = (value: number) => {
    if (value >= 80) return { badge: "bg-red-100 text-red-700", bar: "bg-red-500", label: "혼잡" };
    if (value >= 50) return { badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500", label: "보통" };
    return { badge: "bg-green-100 text-green-700", bar: "bg-green-500", label: "쾌적" };
  };

  const filtered = congestionData.filter(item =>
    !searchQuery ||
    item.station_name?.includes(searchQuery) ||
    item.line_name?.includes(searchQuery)
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">실시간 혼잡도</h2>

      <div className="bg-white rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="노선, 역 이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500">혼잡도 데이터 불러오는 중...</div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500">{error}</div>
      )}

      <div className="space-y-3">
        {!loading && !error && filtered.map((item, idx) => {
          const congestion = getCongestionColor(item.congestion_rate ?? item.average_congestion ?? 0);
          const percentage = item.congestion_rate ?? item.average_congestion ?? 0;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-gray-800">{item.station_name ?? item.station}</span>
                  <span className="ml-2 text-sm text-gray-600">{item.line_name ?? item.line}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${congestion.badge}`}>
                  {congestion.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${congestion.bar}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">{percentage}%</div>
            </div>
          );
        })}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative z-10 bg-white border-t border-gray-200 p-4 flex justify-around items-center">
      <button
        onClick={() => navigate("/")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs">홈</span>
      </button>
      <button
        onClick={() => navigate("/map")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/map") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <Map className="w-6 h-6" />
        <span className="text-xs">지도</span>
      </button>
      <button
        onClick={() => navigate("/account")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/account") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <User className="w-6 h-6" />
        <span className="text-xs">계정</span>
      </button>
    </div>
  );
}

function RouteResultScreen() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<"congestion" | "fastest" | "shortest">("congestion");

  const routes = {
    congestion: {
      title: "혼잡도 반영 경로",
      icon: TrendingDown,
      time: "42분",
      distance: "18.5km",
      congestion: "쾌적",
      steps: [
        { type: "지하철", line: "2호선", from: "강남역", to: "홍대입구역", congestion: "쾌적", time: "35분" },
        { type: "도보", from: "홍대입구역", to: "목적지", time: "7분" }
      ],
      highlight: true,
      description: "혼잡한 환승역을 피한 경로입니다"
    },
    fastest: {
      title: "최소 시간",
      icon: Clock,
      time: "38분",
      distance: "16.2km",
      congestion: "혼잡",
      steps: [
        { type: "지하철", line: "2호선", from: "강남역", to: "신촌역", congestion: "혼잡", time: "28분" },
        { type: "환승", from: "신촌역", to: "신촌역", time: "5분" },
        { type: "지하철", line: "경의선", from: "신촌역", to: "홍대입구역", congestion: "보통", time: "5분" }
      ],
      highlight: false,
      description: "가장 빠르지만 환승역이 혼잡합니다"
    },
    shortest: {
      title: "최단 거리",
      icon: Zap,
      time: "45분",
      distance: "15.8km",
      congestion: "보통",
      steps: [
        { type: "지하철", line: "6호선", from: "강남역", to: "합정역", congestion: "보통", time: "32분" },
        { type: "도보", from: "합정역", to: "홍대입구역", time: "13분" }
      ],
      highlight: false,
      description: "이동 거리가 가장 짧은 경로입니다"
    }
  };

  const currentRoute = routes[selectedRoute];
  const RouteIcon = currentRoute.icon;

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "쾌적": return "text-green-600 bg-green-50";
      case "보통": return "text-yellow-600 bg-yellow-50";
      case "혼잡": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold mb-3">
          ← 돌아가기
        </button>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">강남역</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Navigation className="w-4 h-4" />
            <span className="font-medium">홍대입구역</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-white border-b border-gray-200 overflow-x-auto">
        {Object.entries(routes).map(([key, route]) => {
          const Icon = route.icon;
          const isSelected = selectedRoute === key;
          const isHighlighted = route.highlight;

          return (
            <button
              key={key}
              onClick={() => setSelectedRoute(key as typeof selectedRoute)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? isHighlighted
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-800 text-white border-gray-800"
                  : isHighlighted
                    ? "bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{route.title}</span>
                {isHighlighted && !isSelected && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">추천</span>
                )}
              </div>
              <div className="text-sm opacity-90">{route.time}</div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={`bg-white rounded-xl p-4 shadow-md border-2 ${
          currentRoute.highlight ? "border-blue-400" : "border-transparent"
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <RouteIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">{currentRoute.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{currentRoute.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCongestionColor(currentRoute.congestion)}`}>
              {currentRoute.congestion}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{currentRoute.time}</div>
              <div className="text-xs text-gray-500">소요시간</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">{currentRoute.distance}</div>
              <div className="text-xs text-gray-500">이동거리</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getCongestionColor(currentRoute.congestion).split(' ')[0]}`}>
                {currentRoute.congestion}
              </div>
              <div className="text-xs text-gray-500">혼잡도</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            {currentRoute.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  {index < currentRoute.steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 my-1" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{step.type}</span>
                    {step.line && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        {step.line}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{step.time}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {step.from} → {step.to}
                  </div>
                  {step.congestion && (
                    <div className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getCongestionColor(step.congestion)}`}>
                      혼잡도: {step.congestion}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">혼잡도 정보</h4>
              <p className="text-sm text-blue-800">
                현재 시간대(오전 8시 30분) 기준으로 실시간 혼잡도를 반영한 경로입니다.
                환승역의 혼잡도와 열차 내 혼잡도를 모두 고려하여 가장 쾌적한 경로를 추천합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          출발하기
        </button>
      </div>
    </div>
  );
}

function SignupScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: ""
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const handleCheckUsername = () => {
    if (!formData.username) return;

    setIsCheckingUsername(true);
    setTimeout(() => {
      const isAvailable = Math.random() > 0.5;
      setUsernameAvailable(isAvailable);
      setIsCheckingUsername(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.password || !formData.phone || !formData.email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!usernameAvailable) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }

    alert("회원가입이 완료되었습니다!");
    navigate("/");
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-blue-600">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">회원가입</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setUsernameAvailable(null);
              }}
              placeholder="아이디 입력"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCheckUsername}
              disabled={!formData.username || isCheckingUsername}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:bg-gray-300 hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
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
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="비밀번호 재입력"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <X className="w-4 h-4" />
              <span>비밀번호가 일치하지 않습니다</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-1234-5678"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          가입하기
        </button>
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
  const navigate = useNavigate();

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
          <button className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100">
            <span className="text-gray-800 font-medium">프로필 수정</span>
          </button>
          <button className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100">
            <span className="text-gray-800 font-medium">알림 설정</span>
          </button>
          <button className="w-full p-4 text-left hover:bg-gray-50">
            <span className="text-gray-800 font-medium">로그아웃</span>
          </button>
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
    if (hasVisited) {
      setIsFirstVisit(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (isFirstVisit) {
      setShowSignupPrompt(true);
    }
  };

  const handleSignupResponse = (wantsSignup: boolean) => {
    setShowSignupPrompt(false);
    localStorage.setItem("hasVisited", "true");
    setIsFirstVisit(false);

    if (wantsSignup) {
      navigate("/signup");
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

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
              <button
                onClick={() => handleSignupResponse(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                아니요
              </button>
              <button
                onClick={() => handleSignupResponse(true)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                네
              </button>
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