from flask import Flask, render_template, request
import os
import json
import requests

capitals_path = os.path.join('resources/', 'country_and_capital.json')

with open(capitals_path) as test_file:
    capitals = json.load(test_file)

# Create a dictionary to store the data
country_data = {}

api_token = 'ecfe70a349a8c5a6038e59eef34bc499'
params = {"appid": api_token}

for country in capitals:
    print(country)
    print(capitals[country])
    endpoint = f"http://api.openweathermap.org/geo/1.0/direct?q=${capitals[country]},${country}"
    response = requests.get(endpoint, params=params)

    if response.status_code == 200:
        data = response.json()
        if data:
            coords = [data[0]["lat"], data[0]["lon"]]

            # Add the data to the dictionary
            country_data[country] = {
                "capital_city": capitals[country],
                "lat_lon": coords
            }
        else:
            print("no response")
    else:
        print("error in openweather api response")
        break

# Save the data to a new JSON file
output_path = os.path.join('resources/', 'capitals_latlon.json')
with open(output_path, 'w') as output_file:
    json.dump(country_data, output_file, indent=4)