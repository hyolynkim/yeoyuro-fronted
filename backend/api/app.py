# api/app.py
from flask import Flask, request, jsonify
import joblib
import os
import sys

# 상위 폴더나 models 폴더 참조를 위한 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from models.route_finder import find_optimal_route

app = Flask(__name__)

# 전역 변수로 AI 모델들 로드 관리
RF_MODEL = None
LSTM_SCALER = None

def load_ai_models():
    global RF_MODEL, LSTM_SCALER
    rf_path = 'backend/models/train_rf.py' # 혹은 완성된 .joblib 경로
    scaler_path = 'backend/models/lstm_scaler.joblib'
    
    # 1. train_rf.py에서 저장한 모델 불러오기 (파일이 있을 경우)
    if os.path.exists('backend/models/congestion_rf.joblib'):
        RF_MODEL = joblib.load('backend/models/congestion_rf.joblib')
        print("Random Forest 모델 로드 완료.")
    else:
        print("안내: 아직 학습된 Random Forest .joblib 파일이 없어 가상 스코어로 대체 작동합니다.")
        
    # 2. LSTM용 스케일러 불러오기
    if os.path.exists(scaler_path):
        LSTM_SCALER = joblib.load(scaler_path)
        print("LSTM 스케일러 로드 완료.")

# --- API 엔드포인트 1: 특정 조건의 혼잡도 분류 결과 반환 (Random Forest 연동용) ---
@app.route('/predict/congestion', methods=['POST'])
def predict_congestion():
    """
    요청 JSON 예시: {"passenger_count": 850}
    출퇴근 시간대 버스/지하철 탑승객 수를 받아 여유(0), 보통(1), 혼잡(2) 분류 반환
    """
    data = request.get_json()
    if not data or 'passenger_count' not in data:
        return jsonify({"error": "passenger_count 파라미터가 필요합니다."}), 400
    
    count = data['passenger_count']
    
    # 만약 RF 모델이 정상 로드되었다면 model.predict 사용, 없다면 레벨링 로직 대체
    if RF_MODEL:
        # 실제 데이터 피처 차원에 맞게 입력 정비 필요
        # prediction = RF_MODEL.predict([[count]])[0]
        pass
        
    # train_rf.py에 구현된 의사결정 기준 매핑
    if count > 800:
        result = {"status": "혼잡", "code": 2}
    elif count > 300:
        result = {"status": "보통", "code": 1}
    else:
        result = {"status": "여유", "code": 0}
        
    return jsonify({"passenger_count": count, "prediction": result})

# --- API 엔드포인트 2: 혼잡도 가중치 기반 최적 대안 루트 추천 (Graph 알고리즘 연동) ---
@app.route('/api/routes', methods=['GET'])
def get_optimal_bus_subway_route():
    """
    요청 Query Parameter 예시: /api/routes?start=성신여대입구&end=기흥역&hour=18
    """
    start = request.args.get('start', '성신여대입구')
    end = request.args.get('end', '기흥역')
    hour = request.args.get('hour', default=9, type=int)
    
    # route_finder의 다익스트라 알고리즘 호출
    route_result = find_optimal_route(start, end, hour, rf_model=RF_MODEL)
    
    if not route_result:
        return jsonify({"status": "fail", "message": "해당 정류장/역 경로를 찾을 수 없거나 노선 제한에 걸렸습니다."}), 404
        
    return jsonify({
        "status": "success",
        "search_overview": f"{start} -> {end} ({hour}시 출발)",
        "data": route_result
    })

if __name__ == '__main__':
    # 서버 기동 전 모델 미리 로드
    load_ai_models()
    # 5월 30일 조별 계획인 프론트엔드 연동을 위해 포트 오픈 및 디버그 모드 활성화
    app.run(host='0.0.0.0', port=5000, debug=True)