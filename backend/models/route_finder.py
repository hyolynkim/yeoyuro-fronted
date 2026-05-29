import requests
import urllib.parse

# API Key 설정
ODSAY_API_KEY = "MRru/5qfTWVBfehL8LUgxA"
KAKAO_REST_API_KEY = "6c220101133197233daf87a3ec931801"

def get_coords_from_keyword(keyword):
    """카카오 로컬 API 좌표 변환 (100% 실시간 호출)"""
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": keyword}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=3.0)
        if response.status_code == 200:
            documents = response.json().get('documents')
            if documents and len(documents) > 0:
                lon = str(documents[0]['x'])
                lat = str(documents[0]['y'])
                return lon, lat
    except Exception as e:
        print(f"카카오 API 에러: {e}")
        
    return None, None

def extract_sub_paths(path):
    """ODsay 원본 데이터에서 상세 이동 수단(지하철, 버스, 도보) 추출"""
    sub_paths = []
    for sub_path in path.get("subPath", []):
        traffic_type = sub_path.get("trafficType")
        
        if traffic_type == 1:  # 지하철
            lanes = sub_path.get("lane", [])
            sub_paths.append({
                "traffic_type": 1,
                "type_name": "지하철",
                "lane_name": lanes[0].get("name", "") if lanes else "",
                "start_name": sub_path.get("startName", ""),
                "end_name": sub_path.get("endName", ""),
                "station_count": sub_path.get("stationCount", 0),
                "section_time_min": sub_path.get("sectionTime", 0),
                "is_express": False,
                "stations": [stop.get("stationName") for stop in sub_path.get("passStopList", {}).get("stations", [])]
            })
            
        elif traffic_type == 2:  # 버스
            lanes = sub_path.get("lane", [])
            bus_no = lanes[0].get("busNo", "") if lanes else ""
            sub_paths.append({
                "traffic_type": 2,
                "type_name": "버스",
                "lane_name": bus_no,
                "start_name": sub_path.get("startName", ""),
                "end_name": sub_path.get("endName", ""),
                "station_count": sub_path.get("stationCount", 0),
                "section_time_min": sub_path.get("sectionTime", 0),
                "is_express": "5000" in bus_no or "5005" in bus_no,
                "stations": [stop.get("stationName") for stop in sub_path.get("passStopList", {}).get("stations", [])],
                "bus_congestion": None
            })
            
        elif traffic_type == 3:  # 도보
            sub_paths.append({
                "traffic_type": 3,
                "type_name": "도보",
                "section_time_min": sub_path.get("sectionTime", 0)
            })
            
    return sub_paths

def get_odsay_route(sx, sy, ex, ey):
    """ODsay API 호출"""
    safe_key = urllib.parse.unquote(ODSAY_API_KEY)
    url = "https://api.odsay.com/v1/api/searchPubTransPathT"
    params = {"apiKey": safe_key, "SX": sx, "SY": sy, "EX": ex, "EY": ey, "SearchPathType": 0}
    
    try:
        headers = {"Origin": "http://localhost:8000", "Referer": "http://localhost:8000/"}
        response = requests.get(url, params=params, headers=headers, timeout=5.0)
        if response.status_code == 200:
            return response.json()
    except:
        return None

def find_cat_optimal_route(start_name, end_name, departure_hour):
    """최적 경로 반환 메인 로직"""
    sx, sy = get_coords_from_keyword(start_name)
    ex, ey = get_coords_from_keyword(end_name)
    
    if not sx or not ex:
        return {
            "status": "fail",
            "message": f"출발지('{start_name}') 또는 목적지('{end_name}')의 위치를 찾을 수 없습니다."
        }
        
    odsay_data = get_odsay_route(sx, sy, ex, ey)
    if not odsay_data or "result" not in odsay_data or "path" not in odsay_data["result"]:
        return {"status": "fail", "message": "대중교통 경로를 찾을 수 없습니다."}
    
    path_list = odsay_data["result"]["path"]
    refined_paths = []
    
    for path in path_list:
        base_time = path["info"]["totalTime"]
        transfer_count = path["info"].get("transferCount", 0)
        
        detailed_segments = extract_sub_paths(path)
        has_express_bus = any(seg.get("is_express", False) for seg in detailed_segments if seg["traffic_type"] == 2)
        
        total_penalty = 0
        if has_express_bus and (8 <= departure_hour <= 10 or 18 <= departure_hour <= 20):
            total_penalty += 30
            
        comfort_time = base_time + total_penalty
        
        refined_paths.append({
            "path_type": path["pathType"],
            "original_time_min": base_time,
            "estimated_comfort_time_min": comfort_time,
            "payment_krw": path["info"].get("payment", 0),
            "transfer_count": transfer_count,
            "has_express_bus": has_express_bus,
            "first_start_station": path["info"].get("firstStartStation", ""),
            "last_end_station": path["info"].get("lastEndStation", ""),
            "sub_paths": detailed_segments
        })
        
    refined_paths.sort(key=lambda x: x["estimated_comfort_time_min"])
    
    return {
        "status": "success",
        "start": start_name,
        "end": end_name,
        "departure_hour": departure_hour,
        "routes": refined_paths
    }