import geopandas as gpd

# Step 3: Load the shapefile using geopandas
shapefile_path = "resources/countries.shp"
gdf = gpd.read_file("resources/countries.shp")

# Step 4: Save the GeoJSON data
geojson_path = "resources/countries.geojson"
gdf.to_file(geojson_path, driver='GeoJSON')

print("Shapefile converted to GeoJSON successfully.")
