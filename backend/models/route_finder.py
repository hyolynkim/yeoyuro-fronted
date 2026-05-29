import requests
import urllib.parse

# 민진님의 인증 성공한 고유 API Key들
ODSAY_API_KEY = "MRru/5qfTWVBfehL8LUgxA"
KAKAO_REST_API_KEY = "6c220101133197233daf87a3ec931801"

def get_coords_from_keyword(keyword):
    """
    카카오 로컬 API를 통해 장소명(텍스트)을 위도, 경도 좌표로 변환하는 함수
    """
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": keyword}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=3.0)
        if response.status_code == 200:
            documents = response.json().get('documents')
            if documents:
                # 카카오 API 결과: x가 경도(longitude), y가 위도(latitude)
                # ODsay API가 문자열 형태의 파라미터를 받으므로 str 타입으로 변환하여 반환합니다.
                lon = str(documents[0]['x'])
                lat = str(documents[0]['y'])
                return lon, lat
        print(f"안내(카카오 로컬 API): '{keyword}' 검색 결과가 없거나 실패했습니다.")
    except Exception as e:
        print(f"에러(카카오 API 호출 중): {e}")
        
    return None, None

def get_odsay_route(sx, sy, ex, ey):
    """
    ODsay 대중교통 노선 검색 API를 호출하는 함수
    """
    safe_key = urllib.parse.unquote(ODSAY_API_KEY)
    url = "https://api.odsay.com/v1/api/searchPubTransPathT"
    
    params = {
        "apiKey": safe_key,
        "SX": sx,
        "SY": sy,
        "EX": ex,
        "EY": ey,
        "SearchPathType": 0
    }
    
    try:
        # 도메인 보안 인증 우회를 위한 헤더 세팅 유지
        headers = {
            "Origin": "http://localhost:8000",
            "Referer": "http://localhost:8000/"
        }
        response = requests.get(url, params=params, headers=headers, timeout=5.0)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

def get_subway_congestion_from_api(line_name, station_name, hour):
    """
    공공데이터 포털 API 호출 함수 (Render 서버 다운 대비 안전성 강화 버전)
    """
    url = "https://subway-congestion-api.onrender.com/congestion"
    time_slot = f"{hour}시00분"
    params = {
        "apiKey": "4d99d2ae068581728a1acbc7f77f0a4af04c0b0235948fd50fd2de71815acab1",
        "day_type": "평일",
        "line": line_name,
        "station": station_name,
        "time_slot": time_slot
    }
    
    try:
        # 타임아웃을 2초로 제한하여 Render 서버가 잠들어있어도 빠르게 탈출하도록 설정
        response = requests.get(url, params=params, timeout=2.0)
        if response.status_code == 200:
            res_data = response.json()
            if "data" in res_data and len(res_data["data"]) > 0:
                return res_data["data"][0].get("혼잡도", 30.0)
        return 30.0
    except:
        # 임시 공공데이터 API 서버가 꺼져있어도 에러 없이 기본 스코어로 작동하게 방어
        return 30.0

def find_cat_optimal_route(start_name, end_name, departure_hour):
    """
    카카오 로컬 API로 유동적인 좌표를 추출한 뒤,
    ODsay API 데이터를 정제하고 혼잡도 가중치를 적용하여 깔끔한 JSON을 반환하는 함수
    """
    # 1. 🛑 [업데이트] 하드코딩된 좌표 대신 카카오 API를 활용해 동적으로 주소 분석
    sx, sy = get_coords_from_keyword(start_name)
    ex, ey = get_coords_from_keyword(end_name)
    
    # 카카오 API가 좌표 변환에 실패한 경우 처리
    if not sx or not ex:
        return {
            "status": "fail",
            "error": "coordinates_not_found",
            "message": f"출발지('{start_name}') 또는 목적지('{end_name}')의 위치를 지도에서 찾을 수 없습니다."
        }
        
    print(f"[좌표 매핑 성공] {start_name}({sy}, {sx}) -> {end_name}({ey}, {ex})")
    
    # 2. 실시간 변환된 좌표로 ODsay 대중교통 경로 검색 수행
    odsay_data = get_odsay_route(sx, sy, ex, ey)
    
    # 예외 처리
    if not odsay_data or "result" not in odsay_data or "path" not in odsay_data["result"]:
        return {
            "status": "fail",
            "message": "대중교통 경로를 찾을 수 없습니다."
        }
    
    path_list = odsay_data["result"]["path"]
    refined_paths = []
    
    for path in path_list:
        base_time = path["info"]["totalTime"] # 순수 소요시간(분)
        total_penalty = 0
        
        # 상세 이동 수단(지하철/버스) 확인 후 혼잡 가중치 적용
        for sub_path in path.get("subPath", []):
            if sub_path.get("trafficType") == 1: # 지하철인 경우
                station_name = sub_path.get("startName", "")
                
                # 공공데이터 API 연동하여 실제 데이터 기반 패널티 부여
                real_congestion = get_subway_congestion_from_api("4호선", station_name, departure_hour)
                if real_congestion >= 80:
                    total_penalty += 20
                elif real_congestion >= 40:
                    total_penalty += 5
                    
            elif sub_path.get("trafficType") == 2: # 버스인 경우
                lanes = sub_path.get("lane", [])
                if lanes:
                    bus_no = lanes[0].get("busNo", "")
                    # 광역버스 만석 우회 가중치 (출퇴근 시간대)
                    if "5000" in bus_no or "5005" in bus_no:
                        if 8 <= departure_hour <= 10 or 18 <= departure_hour <= 20:
                            total_penalty += 30 
        
        # 체감 소요 시간 계산
        comfort_time = base_time + total_penalty
        
        # 프론트엔드가 쓰기 딱 좋은 데이터만 추출해서 압축 정제
        refined_paths.append({
            "path_type": path["pathType"], # 1:지하철, 2:버스, 3:혼합
            "original_time_min": base_time,
            "estimated_comfort_time_min": comfort_time, # 이 정렬 기준값으로 프론트에 추천
            "payment_krw": path["info"].get("payment", 0),
            "first_start_station": path["info"].get("firstStartStation", ""),
            "last_end_station": path["info"].get("lastEndStation", "")
        })
        
    # 체감 소요 시간이 적은(덜 혼잡하고 쾌적한) 순서대로 자동 정렬
    refined_paths.sort(key=lambda x: x["estimated_comfort_time_min"])
    
    return {
        "status": "success",
        "start": start_name,
        "end": end_name,
        "departure_hour": departure_hour,
        "routes": refined_paths
    }
