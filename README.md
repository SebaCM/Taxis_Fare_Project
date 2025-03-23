# 🚕 Taxi Fare and Trip Duration Prediction  

This project focuses on building **machine learning models** to predict **taxi fares** and **trip durations** using multiple datasets. It implements models ranging from simple regressors (SGD, Random Forest) to advanced techniques like **XGBoost** and **Neural Networks**.  

---

## 📁 Project Structure  

1. **Data Preprocessing and Exploratory Data Analysis (EDA)**  
2. **Feature Engineering and Reduction**  
3. **Model Training and Evaluation**  
4. **Model Persistence (Saving and Loading Models)**  
5. **Deployment on Google Cloud Service**  

---

## 📊 Datasets Used  

1. **Yellow Taxi** – Taxi ride details including fare amount.  
2. **Taxi Zones** – Geospatial data for NYC taxi zones.  
3. **Weather** – Weather conditions during trips.  
4. **Traffic** – Traffic patterns and conditions.  

---

## 📚 Libraries Used  

### Core Libraries:  
- **Data Analysis**: `pandas`, `numpy`, `matplotlib`, `seaborn`  
- **Machine Learning**: `scikit-learn`, `xgboost`, `tensorflow`, `keras`  
- **Model Saving**: `joblib`  
- **API Handling**: `requests`, `retry_requests`, `requests_cache`, `openmeteo_requests`, `sodapy`  

---

## 🛠️ Data Preprocessing  

1. **Outlier Treatment**:  
   - Applied **RobustScaler** and **StandardScaler** to handle outliers and normalize features.  

2. **Data Splitting**:  
   - Divided datasets into:  
     - **60%** for training  
     - **20%** for validation  
     - **20%** for testing  

3. **Feature Reduction**:  
   - Used a **correlation matrix** to remove redundant or irrelevant features.  

---

## 🤖 Models Implemented  

1. **SGD Regressor** – Simple and fast linear model.  
2. **Random Forest Regressor** – Ensemble model with hyperparameter tuning.  
3. **XGBoost Regressor** – Gradient boosting for improved performance.  
4. **Neural Network** – Built using `tensorflow.keras`, with dropout and early stopping.  

---

## 📈 Model Training and Evaluation  

Each model is evaluated using the following metrics:  

- **Mean Absolute Error (MAE)** – Measures the average absolute difference.  
- **Mean Squared Error (MSE)** – Penalizes large errors more than MAE.  
- **Root Mean Squared Error (RMSE)** – Square root of MSE for interpretability.  
- **R² Score** – Explains how well the model fits the data.  

---

## 🚀 How to Run the Project  

1. **Clone the repository:**  
   ```bash
   git clone <repository-url>
   cd project-folder

Install the required libraries:
Ensure all dependencies from requirements.txt are installed:

pip install -r requirements.txt

🧰 Requirements (requirements.txt)
pandas
numpy
matplotlib
seaborn
scikit-learn
scipy
joblib
tensorflow
keras
openmeteo_requests
requests_cache
retry_requests
sodapy

☁️ Deployment on Google Cloud Service
The project is deployed using Google Cloud Service, utilizing:

Virtual Machines (VMs) – For model hosting.

Google Maps API – For real-time geolocation and route calculations.

Steps for Deployment:
Set up a Google Cloud VM with necessary resources.

Install project dependencies using requirements.txt.

Deploy the trained models and serve predictions via API.

📌 Future Improvements
Enhanced Hyperparameter Tuning – Using Grid Search and Bayesian Optimization.

LSTM Models – For better time-series prediction.

Model Interpretability – Use SHAP or LIME to understand predictions.

Real-Time Predictions – Optimize API response time for faster results.

✅ This project demonstrates a robust pipeline for taxi fare and trip duration prediction, combining data preprocessing, model development, and cloud deployment.
