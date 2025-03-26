🚖 Taxi Fare and Trip Duration Prediction
This project focuses on building machine learning models to predict taxi fares and trip duration using multiple datasets. It implements models ranging from simple regressors (SGD, Random Forest) to advanced techniques like XGBoost and Neural Networks.

📁 Project Structure
Data Preprocessing and Exploratory Data Analysis (EDA)

Feature Engineering and Dimensionality Reduction

Model Training and Evaluation

Model Persistence (Save and Load Models)

Deployment on Google Cloud Service

📊 Datasets Used
Yellow Taxi – Taxi trip details, including fare.

Taxi Zones – Geospatial data of NYC taxi zones.

Weather – Weather conditions during trips.

Traffic – Traffic patterns and conditions.

📚 Libraries Used
Core Libraries:
Data Analysis: pandas, numpy, matplotlib, seaborn

Machine Learning: scikit-learn, xgboost, tensorflow, keras

Model Saving: joblib

API Handling: requests, retry_requests, requests_cache, openmeteo_requests, sodapy, googlemaps

Inter-Container Communication: redis

🛠️ Data Preprocessing
Handling Outliers:
Applied RobustScaler and StandardScaler to manage outliers and normalize features.

Data Splitting:
Datasets were split as follows:

60% for training

20% for validation

20% for testing

Feature Reduction:
A correlation matrix was used to eliminate redundant or irrelevant features.

🤖 Implemented Models
SGD Regressor – A simple and fast linear model.

Random Forest Regressor – An ensemble model with hyperparameter tuning.

XGBoost Regressor – Gradient boosting model for better performance.

Neural Network – Built with tensorflow.keras, using dropout and early stopping.

📈 Model Training and Evaluation
Each model was evaluated using the following metrics:

Mean Absolute Error (MAE) – Measures the average absolute difference.

Mean Squared Error (MSE) – Penalizes large errors more than MAE.

Root Mean Squared Error (RMSE) – Square root of MSE for better interpretability.

R² Score – Explains how well the model fits the data.

🚀 How to Run the Project Locally

1. Clone the Repository

git clone https://github.com/SebaCM/Taxis_Fare_Project.git
cd Taxis_Fare_Project

2. Install Docker (if not already installed)
   Ensure Docker is installed. You can download it from here.

3. Build and Run the Project with Docker
   Run the following command to build and start the project:

docker-compose up --build -d

This sets up the environment, builds the image, and runs the application in the background.

4. Access the Service
   Once the container is running, access the service via the following URL:

http://localhost:8081/ui/index.html

5. Use the Model
   Once the environment is set up, you can test the models and make predictions by providing the relevant data. You can also evaluate the models using the metrics described in the "Model Training and Evaluation" section.

🧰 Requirements (requirements.txt)
Ensure the following libraries are included in requirements.txt:

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
googlemaps
redis

☁️ Deployment on Google Cloud Service
To deploy the project on Google Cloud, follow these steps:

1. Set Up a Virtual Machine (VM) on Google Cloud
   Create a Google Cloud project and enable billing.

Set up a Virtual Machine (VM) to host the model and API.

Select an appropriate machine type based on your needs.

2. Enable Bidirectional Communication
   You must open port 8081 in the firewall rules to allow bidirectional communication.

Go to the Google Cloud Console.

Navigate to VPC Network > Firewall.

Create a new firewall rule:

Name: allow-taxi-api

Traffic Direction: Ingress and Egress (bidirectional)

IP Range: 0.0.0.0/0

Protocols and Ports: tcp:8081

Save the changes.

3. Install Dependencies on the VM
   Access your VM and clone the repository:

git clone https://github.com/SebaCM/Taxis_Fare_Project.git
cd Taxis_Fare_Project

Install the dependencies from requirements.txt:

pip install -r requirements.txt

4. Deploy the Trained Models
   Load the pre-trained models saved with joblib or TensorFlow/Keras.

Run the contanier of model, it's already configured to work

5. Expose the API
   Use Google Cloud API Gateway or App Engine to expose your API.

Ensure port 8081 is open and accessible.

6. Monitor and Maintain
   Use Google Cloud Logging to track model performance and usage.

📌 Future Improvements
Hyperparameter Optimization – Using Grid Search and Bayesian Optimization.

LSTM Models – To improve time-series predictions.

Model Interpretability – Use SHAP or LIME to explain predictions.

Real-Time Predictions – Optimize the API’s response time.

✅ This project demonstrates a robust pipeline for predicting taxi fares and trip durations, combining data preprocessing, model development, and cloud deployment.
