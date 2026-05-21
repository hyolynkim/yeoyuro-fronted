# models/route_finder.py
import heapq

# 1. 지하철 및 버스 샘플 노선도 그래프 정의 (출발역 -> [도착역, 기본 소요시간(분), 대중교통 유형])
# 중간 발표 자료의 '성신여대입구 - 기흥역' 주요 컴포넌트 반영
TRANSPORT_GRAPH = {
    '성신여대입구': [('서울역', 15, '지하철_4호선'), ('순천향대학병원', 20, '버스_간선')],
    '서울역': [('기흥역', 50, '지하철_수인분당선')],
    '순천향대학병원': [('기흥역', 45, '버스_직행_5000')],
    '기흥역': []
}

def get_congestion_weight(transport_type, hour, rf_model=None):
    """
    Random Forest 모델 혹은 예상 혼잡도를 기반으로 가중치를 부여하는 함수
    리턴값: 혼잡도에 더해질 패널티 시간(분)
    """
    # 실제 프로젝트 구현 시: rf_model.predict([[시간대, 유형]]) 형태로 연동
    # 여기서는 시간대에 따른 가상 혼잡도 스코어 지정 (출퇴근 러시아워 시간 가정)
    is_rush_hour = (8 <= hour <= 10) or (18 <= hour <= 20)
    
    if is_rush_hour:
        if '직행' in transport_type: # 광역버스 만석 문제 가중치 반영
            return 30  # 버스가 만석이라 다음 차를 타야 하므로 큰 패널티 부여
        elif '지하철' in transport_type:
            return 15  # 지하철 혼잡 가중치
    return 0  # 여유로운 시간대는 패널티 없음

def find_optimal_route(start, end, departure_hour, rf_model=None):
    """
    다익스트라(Dijkstra) 알고리즘을 변형하여 
    최단 시간 + 혼잡도 가중치가 최소화된 최적 루트를 탐색합니다.
    """
    if start not in TRANSPORT_GRAPH or end not in TRANSPORT_GRAPH:
        return None

    # 우선순위 큐: (누적 체감 시간, 현재 노드, 거쳐온 경로 리스트)
    queue = [(0, start, [start])]
    distances = {node: float('inf') for node in TRANSPORT_GRAPH}
    distances[start] = 0
    
    best_route = []
    min_cost = float('inf')

    while queue:
        current_cost, current_node, path = heapq.heappop(queue)

        if current_node == end:
            if current_cost < min_cost:
                min_cost = current_cost
                best_route = path
            continue

        if current_cost > distances[current_node]:
            pass

        for next_node, base_time, trans_type in TRANSPORT_GRAPH[current_node]:
            # 혼잡도 가중치 계산 (체감 편의성 반영)
            congestion_penalty = get_congestion_weight(trans_type, departure_hour, rf_model)
            total_weight = current_cost + base_time + congestion_penalty

            if total_weight < distances[next_node]:
                distances[next_node] = total_weight
                heapq.heappush(queue, (total_weight, next_node, path + [f"{trans_type} -> {next_node}"]))

    return {
        "departure_time_hour": departure_hour,
        "total_estimated_comfort_time": min_cost,
        "route_flow": best_route
    }

if __name__ == "__main__":
    # 테스트 구동: 러시아워(오후 18시) 성신여대입구 -> 기흥역 탐색
    result = find_optimal_route('성신여대입구', '기흥역', 18)
    print("러시아워 최적 가중치 경로 결과:")
    print(result)