"""
Export GeoJSON from LAS
"""
import laspy
import sys, os
import numpy as np
import geopandas as gpd
from shapely.geometry import Point

def las_to_geojson(las_path, crs_out="EPSG:4979"):
    if not os.path.exists(las_path):
        print(f"Error: Las point '{las_path}' does not exist.")
        return

    las = laspy.read(las_path)

    x = np.array(las.x)
    y = np.array(las.y)
    z = np.array(las.z)

    # Geometrie 3D (lat, lon, elevazione)
    geometries = [Point(xi, yi, zi) for xi, yi, zi in zip(x, y, z)]

    # GeoDataFrame con CRS a 3 dimensioni (EPSG:4979)
    gdf = gpd.GeoDataFrame({}, geometry=geometries, crs=crs_out)

    # Definisce percorso output nello stesso folder
    base_name = os.path.splitext(os.path.basename(las_path))[0]
    output_dir = os.path.dirname(las_path)
    output_path = os.path.join(output_dir, f"{base_name}_3D.geojson")
    
    # Salva il file GeoJSON
    gdf.to_file(output_path, driver="GeoJSON")
    print(f"GeoJSON salvato in: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py path_to_cloud.las")
    else:
        project_path = sys.argv[1]
        las_to_geojson(project_path)