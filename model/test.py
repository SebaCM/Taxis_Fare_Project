import pickle

# # Load the model from the pickle file
with open('duration_model.pkl', 'rb') as f:
     duration_model = pickle.load(f)
with open('xgb_fare.pkl', 'rb') as f:
    fare_model = pickle.load(f)
