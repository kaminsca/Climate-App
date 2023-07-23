from flask import Flask, render_template, request
import os
import json
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
#     return render_template('test.html', markers=markers)


# @app.route("/map")
# def about():
#   return render_template('map.html')
@app.route("/", methods=["GET", "POST"])
def map():
  filename = os.path.join('app/resources/', 'countries.json')

  with open(filename) as test_file:
    countries = json.load(test_file)

  return render_template('country_select.html', countries_json=countries)

if __name__ == "__main__":
  app.run(debug=True, port=5000, threaded=True)