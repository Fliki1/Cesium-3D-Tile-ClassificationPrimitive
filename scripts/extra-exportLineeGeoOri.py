import laspy
import numpy as np
import geopandas as gpd
from shapely.geometry import LineString
from collections import defaultdict

# === Carica il file LAS ===
las = laspy.read(r"D:\prova_di_classificazione\point_colorata_classificata\car.las")
x = np.array(las.x)
y = np.array(las.y)
z = np.array(las.z)

# === Imposta precisione per "colonne" (cioè gruppi con stesso x) ===
precisione_colonna = 3  # ad esempio, 3 -> gruppi ogni 0.001°

# === Raggruppa i punti per x arrotondato ===
gruppi = defaultdict(list)
for xi, yi, zi in zip(x, y, z):
    chiave_colonna = round(xi, precisione_colonna)
    gruppi[chiave_colonna].append((xi, yi, zi))

# === Crea linee ordinate per y (dal basso verso l’alto) ===
linee = []
for punti in gruppi.values():
    if len(punti) < 2:
        continue
    punti.sort(key=lambda p: p[1])  # ordina per y crescente
    linee.append(LineString(punti))  # crea LineString 3D

# === Crea GeoDataFrame e salva in GeoJSON ===
gdf_linee = gpd.GeoDataFrame({}, geometry=linee, crs="EPSG:4979")
gdf_linee.to_file("D:\prova_di_classificazione\9\linee_verticali.geojson", driver="GeoJSON")
