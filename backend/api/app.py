from flask import Flask, request, jsonify
import joblib
import os
import sys

# 🔥 [경로 최적화] 실행 위치에 상관없이 절대 경로로 정확히 잡아줍니다.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/ 폴더 위치
sys.path.append(BASE_DIR)

from models.route_finder import find_cat_optimal_route

app = Flask(__name__)

# 브라우저에서 한글이 깨지지 않고 정상 출력되도록 설정
app.config['JSON_AS_ASCII'] = False
RF_MODEL = None
LSTM_SCALER = None

def load_ai_models():
    global RF_MODEL, LSTM_SCALER
    
    # 🔥 절대 경로 기준으로 모델 파일 경로 재설정
    rf_path = os.path.join(BASE_DIR, 'models', 'congestion_rf.joblib')
    scaler_path = os.path.join(BASE_DIR, 'models', 'lstm_scaler.joblib')
    
    if os.path.exists(rf_path):
        RF_MODEL = joblib.load(rf_path)
        print("Random Forest 모델 로드 완료.")
    else:
        print("안내: 학습된 Random Forest 파일이 없어 가상 스코어로 대체 작동합니다.")
        
    if os.path.exists(scaler_path):
        LSTM_SCALER = joblib.load(scaler_path)
        print("LSTM 스케일러 로드 완료.")

# API 엔드포인트 1: 특정 조건의 혼잡도 레벨링 결과 반환
@app.route('/predict/congestion', methods=['POST'])
def predict_congestion():
    data = request.get_json()
    if not data or 'passenger_count' not in data:
        return jsonify({"error": "passenger_count 파라미터가 필요합니다."}), 400
    
    count = data['passenger_count']
    
    if count > 800:
        result = {"status": "혼잡", "code": 2}
    elif count > 300:
        result = {"status": "보통", "code": 1}
    else:
        result = {"status": "여유", "code": 0}
        
    return jsonify({"passenger_count": count, "prediction": result})

# API 엔드포인트 2: ODsay API + 혼잡도 가중치 기반 최적 대안 루트 추천
@app.route('/api/routes', methods=['GET'])
def get_optimal_route():
    start = request.args.get('start', '성신여대입구')
    end = request.args.get('end', '기흥역')
    hour = request.args.get('hour', default=9, type=int)
    
    # route_finder.py의 핵심 함수 실행하여 결과 획득
    final_result = find_cat_optimal_route(start, end, hour)
    return jsonify(final_result)


if __name__ == '__main__':
    import os
    # Render의 환경변수 PORT를 읽어오고, 없으면 기본값 5000을 사용합니다.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)