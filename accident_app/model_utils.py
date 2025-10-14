import joblib
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, Pool

# --- Load model and encoder info ---
model = CatBoostRegressor()
model.load_model("model/catboost_model.cbm")

encoder_info = joblib.load("model/encoder_info.pkl")
angle_map = encoder_info.get("angle_map", {'morning': 0, 'afternoon': 2*np.pi/3, 'evening': 4*np.pi/3})
cat_cols = encoder_info.get("cat_cols", [])
num_cols = encoder_info.get("num_cols", [])
cyclic_cols = encoder_info.get("cyclic_cols", [])

def add_time_cyclic(df, col="time_of_day", angle_map=angle_map):
    """Add sine and cosine cyclical features for time_of_day."""
    angles = df[col].map(angle_map).fillna(0.0)
    df[col + "_sin"] = np.sin(angles)
    df[col + "_cos"] = np.cos(angles)
    return df

def predict_accident_risk(form_data):
    """
    Transform input form data to match training structure and predict accident risk.
    """
    # Convert input to DataFrame
    df = pd.DataFrame([form_data])

    # Convert booleans to ints
    bool_cols = ["road_signs_present", "public_road", "holiday", "school_season"]
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].astype(int)

    # Add cyclical features
    df = add_time_cyclic(df)

    # Align columns to training features
    all_features = cat_cols + num_cols + cyclic_cols
    df = df.reindex(columns=all_features, fill_value=0)

    # Create CatBoost Pool to preserve categorical info
    pool = Pool(df, cat_features=cat_cols)

    # Make prediction
    pred = model.predict(pool)[0]
    return round(float(pred), 4)
