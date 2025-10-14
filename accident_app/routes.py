from flask import Blueprint, render_template, request
from accident_app.forms import RoadForm
from accident_app.model_utils import predict_accident_risk

# Blueprint setup
main = Blueprint("main", __name__)

@main.route("/", methods=["GET", "POST"])
def index():
    """
    Main route: display form and handle prediction submission.
    """
    form = RoadForm()
    prediction = None
    data = None

    if form.validate_on_submit():
        # Collect form data into dictionary
        data = {
            "road_type": form.road_type.data,
            "num_lanes": form.num_lanes.data,
            "curvature": float(form.curvature.data),
            "speed_limit": form.speed_limit.data,
            "lighting": form.lighting.data,
            "weather": form.weather.data,
            "road_signs_present": form.road_signs_present.data,
            "public_road": form.public_road.data,
            "time_of_day": form.time_of_day.data,
            "holiday": form.holiday.data,
            "school_season": form.school_season.data,
            "num_reported_accidents": form.num_reported_accidents.data
        }

        # Get prediction from model
        prediction = predict_accident_risk(data)

        return render_template("result.html", prediction=prediction, data=data)
    else:
        print("Form errors:", form.errors)

    return render_template("index.html", form=form)
