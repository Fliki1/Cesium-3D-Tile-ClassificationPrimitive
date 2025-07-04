"""
Non avendo trovato risultati decenti
analizzo i singoli formati: punti
"""
import laspy
import numpy as np
import geopandas as gpd
from shapely.geometry import Point

# Carica la nuvola
las = laspy.read(r"D:\prova_di_classificazione\point_colorata_classificata\car.las")

x = np.array(las.x)
y = np.array(las.y)
z = np.array(las.z)

# Geometrie 3D (lat, lon, elevazione)
geometries = [Point(xi, yi, zi) for xi, yi, zi in zip(x, y, z)]

# GeoDataFrame con CRS a 3 dimensioni (EPSG:4979)
gdf = gpd.GeoDataFrame({}, geometry=geometries, crs="EPSG:4979")

# Salva GeoJSON
gdf.to_file("D:\prova_di_classificazione\8\output_3D.geojson", driver="GeoJSON")
