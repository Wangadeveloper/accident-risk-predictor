from flask import Blueprint, render_template, request, jsonify
from accident_app.model_utils import predict_accident_risk
import random

main = Blueprint("main", __name__)

@main.route("/")
def index():
    return render_template("index.html")

@main.route("/game_page")
def game_page():
    """Render the game template."""
    return render_template("game.html")

@main.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    prediction = predict_accident_risk(data)
    return jsonify({"prediction": round(prediction, 2)})

@main.route("/game", methods=["GET"])
def game():
    """Generate two random roads and return safer road info as JSON."""
    def random_road():
        return {
            "road_type": random.choice(["urban", "rural", "highway"]),
            "num_lanes": random.randint(1, 4),
            "curvature": round(random.uniform(0, 1), 2),
            "speed_limit": random.randint(30, 120),
            "lighting": random.choice(["daylight", "dim", "night"]),
            "weather": random.choice(["clear", "rainy", "foggy"]),
            "road_signs_present": random.choice([0, 1]),
            "public_road": random.choice([0, 1]),
            "time_of_day": random.choice(["morning", "afternoon", "evening"]),
            "holiday": random.choice([0, 1]),
            "school_season": random.choice([0, 1]),
            "num_reported_accidents": random.randint(0, 5)
        }

    road1 = random_road()
    road2 = random_road()

    risk1 = predict_accident_risk(road1)
    risk2 = predict_accident_risk(road2)

    safer = 0 if risk1 < risk2 else 1
    desc1 = f"{road1['num_lanes']} lanes, curvature {road1['curvature']}, {road1['lighting']}, {road1['weather']}"
    desc2 = f"{road2['num_lanes']} lanes, curvature {road2['curvature']}, {road2['lighting']}, {road2['weather']}"

    return jsonify({
        "road1_desc": desc1,
        "road2_desc": desc2,
        "safer_road": safer
    })
