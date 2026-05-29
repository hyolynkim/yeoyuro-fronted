from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from models.route_finder import find_cat_optimal_route

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JSON_AS_ASCII'] = False

RF_MODEL = None
LSTM_SCALER = None

def load_ai_models():
    global RF_MODEL, LSTM_SCALER
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

# API 엔드포인트 2: 사용자가 주소를 입력하면 카카오 좌표 변환을 거쳐 최적 대안 루트 반환
@app.route('/api/routes', methods=['GET'])
def get_optimal_route():
    # request.args.get()을 사용하여 프론트엔드가 보낸 파라미터를 동적으로 받습니다.
    # 프론트에서 아무것도 안 보내면 기본값으로 '성신여대입구', '기흥역'이 잡힙니다.
    start = request.args.get('start', '성신여대입구')
    end = request.args.get('end', '기흥역')
    hour = request.args.get('hour', default=9, type=int)
    
    # route_finder.py의 함수 실행 (텍스트를 주면 내부에서 좌표로 바꿈)
    final_result = find_cat_optimal_route(start, end, hour)
    
    # 만약 카카오 API 등에서 좌표를 못 찾아서 에러 딕셔너리가 반환됐다면 에러 상태코드 반환
    if "error" in final_result:
        return jsonify(final_result), 400
        
    return jsonify(final_result)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    load_ai_models()  # 서버 시작 시 모델 로드 함수 호출 추가
    app.run(host='0.0.0.0', port=port)
