from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, FloatField, BooleanField, SubmitField
from wtforms.validators import DataRequired, NumberRange

class RoadForm(FlaskForm):
    road_type = SelectField("Road Type", choices=[("urban", "Urban"), ("rural", "Rural"), ("highway", "Highway")], validators=[DataRequired()])
    num_lanes = IntegerField("Number of Lanes", validators=[DataRequired(), NumberRange(min=1, max=10)])
    curvature = FloatField(
        "Curvature (0–1)",
        validators=[DataRequired(), NumberRange(min=0, max=1)],
        description="Curvature measures how much the road bends — 0 for straight roads, 1 for sharp turns."
    )
    speed_limit = IntegerField("Speed Limit", validators=[DataRequired()])
    lighting = SelectField("Lighting", choices=[("daylight", "Daylight"), ("dim", "Dim"), ("night", "Night")])
    weather = SelectField("Weather", choices=[("clear", "Clear"), ("rainy", "Rainy"), ("foggy", "Foggy")])
    time_of_day = SelectField("Time of Day", choices=[("morning", "Morning"), ("afternoon", "Afternoon"), ("evening", "Evening")])
    road_signs_present = BooleanField("Road Signs Present")
    public_road = BooleanField("Public Road")
    holiday = BooleanField("Holiday")
    school_season = BooleanField("School Season")
    num_reported_accidents = IntegerField("Reported Accidents", validators=[DataRequired(), NumberRange(min=0)])
    submit = SubmitField("Predict Risk")
