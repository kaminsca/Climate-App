from flask import Flask, render_template, request, jsonify
import os
import json
import requests
import wikipedia
import sys
# import random
from fatsecret import Fatsecret

app = Flask(__name__)


# @app.route("/", methods=["GET", "POST"])
# def root():
#   if request.method == "POST":
#     # Render the page with the map
#     return render_template('results.html', markers={}, lat=request.form["lat"], lon=request.form["lon"])
#   else:
#     # Render the input form
#     markers = [
#       {
#         'lat': 0,
#         'lon': 0,
#         'popup': 'This is the middle of the map.'
#       }
#     ]
#     return render_template('home_page.html', markers=markers)


@app.route("/map")
def about():
    return render_template('map.html')


@app.route("/")
def home():
    for path in sys.path:
        print(path)
    return render_template('home_page.html')
@app.route("/US", methods=["GET", "POST"])
def US_temps():
    filename = os.path.join('app/resources/', 'us_capitals.json')

    with open(filename) as test_file:
        us_capitals = json.load(test_file)

    return render_template('leaflet_map.html', us_capitals=us_capitals)


@app.route("/historical", methods=["GET"])
def historical_comparison_US():
    filename = os.path.join('app/resources/', 'us_capitals.json')

    with open(filename) as test_file:
        us_capitals = json.load(test_file)

    filename = os.path.join('app/resources/', 'capitals_historical_temp_1950-1980.json')

    with open(filename) as test_file:
        historical_data = json.load(test_file)

    return render_template('historical_comparison.html', us_capitals=us_capitals, historical = historical_data)


@app.route("/world", methods=["GET", "POST"])
def map():
    filename = os.path.join('app/resources/', 'countries.json')

    with open(filename) as test_file:
        countries = json.load(test_file)

    capitals_path = os.path.join('app/resources/', 'capitals_latlon.json')

    with open(capitals_path) as test_file:
        capitals = json.load(test_file)

    return render_template('country_select.html', countries_json=countries, capitals_json=capitals)


# Need to pass lat and lon to get the current weather
@app.route("/get_openweather", methods=["GET"])
def get_data2():
    api_token = 'ecfe70a349a8c5a6038e59eef34bc499'
    endpoint = "https://api.openweathermap.org/data/2.5/weather?"
    params = request.args.to_dict()
    params["appid"] = api_token
    params["units"] = "imperial"
    print(params)

    response = requests.get(endpoint, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print("error in openweather api response")
        return "Error fetching data", 500


# NOAA data
@app.route("/get_data", methods=["GET"])
def get_data():
    api_token = 'FFncshHtjparrgigPQRrgrgkraxGZzjv'
    endpoint = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data"
    headers = {"token": api_token}
    params = request.args.to_dict()

    response = requests.get(endpoint, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return "Error fetching data", 500

@app.route("/wiki", methods=["GET"])
def wiki():
    return render_template('wiki.html')

@app.route("/get_wikipedia_summary", methods=["GET"])
def get_wikipedia_summary():
    search_query = request.args.get("query")
    print(search_query)

    try:
        summary = wikipedia.summary(search_query, auto_suggest=False)
        response = {'summary': summary}
    except wikipedia.DisambiguationError as e:
        # If a disambiguation error occurs, return options for the frontend to handle
        response = {'error': {'code': 'disambiguation', 'options': e.options}}

    return jsonify(response)

@app.route("/nutritionle", methods=["GET"])
def nutritionle():
    return render_template('nutritionle.html')

@app.route("/get_nutrition", methods=["GET"])
def get_nutrition():
    fs = Fatsecret(consumer_key='1b982ca1619f465cb23a0de435893c49', consumer_secret='3d715edacad149998b56dbd44caf56ce')
    search_query = request.args.get("query")
    food = fs.foods_search(search_query)
    return food

if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
