import requests
import os
import json


# What I want: for each capital city, for each of 365 days, get average temperature baseline between 1950 and 1980
# lets try just Nashville first
latitude = 36.16581
longitude = -86.784241
count = 0
daily_mean_temp = {}
for year in range(1950, 1980):
    # get a year at a time
    endpoint = f"https://archive-api.open-meteo.com/v1/archive?latitude={latitude}&longitude={longitude}" \
               f"&start_date={year}-01-01&end_date={year}-12-31&timezone=GMT&temperature_unit=fahrenheit" \
               f"&daily=temperature_2m_max&daily=temperature_2m_min"
    print(year)
    response = requests.get(endpoint)

    if response.status_code == 200:
        # Successful response
        year_data = response.json()

        # update average for each day
        curDay = 0
        for day in year_data["daily"]["time"]:
            parsed_day = day[5:]
            print("day: " + parsed_day)
            print("data: ")
            print(year_data["daily"]["temperature_2m_max"][curDay])
            day_mean_this_year = (year_data["daily"]["temperature_2m_max"][curDay]
                                  + year_data["daily"]["temperature_2m_min"][curDay]) / 2
            print(day_mean_this_year)

            # # new average = (previous average * n + new data pt) / n + 1
            if parsed_day in daily_mean_temp:
                daily_mean_temp[parsed_day] = (daily_mean_temp[parsed_day] * count + day_mean_this_year) / (count + 1)
            else:
                daily_mean_temp[parsed_day] = day_mean_this_year
            curDay += 1
    else:
        # Print the error response content
        print(f"Request failed with status code {response.status_code}:")
        print(response.text)



print(daily_mean_temp)

# Save the data to a new JSON file
output_path = os.path.join('resources/', 'nashville_historical_1950-1980.json')
with open(output_path, 'w') as output_file:
    json.dump(daily_mean_temp, output_file, indent=4)