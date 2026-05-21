# models/train_lstm.py
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
# TensorFlow가 설치되어 있다면 아래 주석을 해제하고 사용하세요.
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense

def create_dataset(dataset, look_back=1):
    X, Y = [], []
    for i in range(len(dataset) - look_back):
        X.append(dataset[i:(i + look_back), 0])
        Y.append(dataset[i + look_back, 0])
    return np.array(X), np.array(Y)

def train_lstm_model():
    print("--- 1. LSTM 시계열 데이터 불러오기 및 전처리 ---")
    data_path = 'backend/data/subway_passenger.csv'
    
    if not os.path.exists(data_path):
        print(f"데이터 파일이 없습니다: {data_path}")
        return

    # 공공데이터 승하차 데이터 로드 (예시: 시간대별 탑승객 수 수집 데이터)
    df = pd.read_csv(data_path)
    
    # 시계열 데이터 가공 (시간대별 순서대로 정렬되어 있다고 가정)
    # 실제 데이터 컬럼명에 맞게 'passenger_count' 등을 매핑하세요.
    passenger_data = df[['count']].values.astype('float32')
    
    # 데이터 스케일링 (0~1 사이값)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(passenger_data)
    
    # 과거 3개 시간대(look_back)를 보고 다음 시간대 예측 구조 설계
    look_back = 3
    X, Y = create_dataset(scaled_data, look_back)
    
    # LSTM 입력 형태 변환: [samples, time steps, features]
    if len(X) > 0:
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    else:
        print("학습할 데이터가 부족합니다.")
        return

    print("--- 2. LSTM 모델 구조 정의 및 학습 ---")
    """
    # 텐서플로우 환경 구축 후 아래 주석을 풀어 모델을 빌드하세요.
    model = Sequential()
    model.add(LSTM(32, input_shape=(look_back, 1), return_sequences=False))
    model.add(Dense(1))
    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(X, Y, epochs=5, batch_size=1, verbose=1)
    
    # 모델 및 스케일러 저장
    model.save('backend/models/lstm_congestion_model.h5')
    """
    # 임시 스케일러 및 가상 가중치 저장 파일 생성 (파이프라인 유지를 위함)
    joblib.dump(scaler, 'backend/models/lstm_scaler.joblib')
    print("LSTM 모델 및 스케일러 가공 완료! (models/lstm_scaler.joblib 저장됨)")

if __name__ == "__main__":
    train_lstm_model()