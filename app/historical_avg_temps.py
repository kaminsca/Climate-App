import requests
import os
import json


capitals_path = os.path.join('resources/', 'us_capitals.json')

with open(capitals_path) as test_file:
    capitals = json.load(test_file)

capitals_hist_avg_temp = {}
# For each capital city, for each of 365 days, get average temperature baseline between 1950 and 1980
for capital in capitals:
    state_name = capital["name"]
    latitude = capital["latitude"]
    longitude = capital["longitude"]
    num_years_seen = 0
    daily_mean_temp = {}
    for year in range(1950, 1980):
        # get a year at a time
        endpoint = f"https://archive-api.open-meteo.com/v1/archive?latitude={latitude}&longitude={longitude}" \
                   f"&start_date={year}-01-01&end_date={year}-12-31&timezone=GMT&temperature_unit=fahrenheit" \
                   f"&daily=temperature_2m_max&daily=temperature_2m_min"
        print(state_name)
        print(year)
        response = requests.get(endpoint)

        if response.status_code == 200:
            # Successful response
            year_data = response.json()

            # update average for each day
            curDay = 0
            for day in year_data["daily"]["time"]:
                parsed_day = day[5:]
                day_mean_this_year = (year_data["daily"]["temperature_2m_max"][curDay]
                                      + year_data["daily"]["temperature_2m_min"][curDay]) / 2

                # # new average = (previous average * n + new data pt) / n + 1
                if parsed_day in daily_mean_temp:
                    daily_mean_temp[parsed_day] = (daily_mean_temp[parsed_day] *
                                                   num_years_seen + day_mean_this_year) / (num_years_seen + 1)
                else:
                    daily_mean_temp[parsed_day] = day_mean_this_year
                curDay += 1
        else:
            # Print the error response content
            print(f"Request failed with status code {response.status_code}:")
            print(response.text)
    capitals_hist_avg_temp[state_name] = daily_mean_temp

# Save the data to a new JSON file
output_path = os.path.join('resources/', 'capitals_historical_temp_1950-1980.json')
with open(output_path, 'w') as output_file:
    json.dump(capitals_hist_avg_temp, output_file, indent=4)