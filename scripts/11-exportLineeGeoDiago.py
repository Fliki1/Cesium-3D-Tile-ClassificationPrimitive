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

# === Precisione per il raggruppamento diagonale ===
precisione_diagonale = 3  # più alto = meno linee

# === Raggruppa per diagonali parallele (/): x - y costante ===
gruppi = defaultdict(list)
for xi, yi, zi in zip(x, y, z):
    chiave = round(xi - yi, precisione_diagonale)
    gruppi[chiave].append((xi, yi, zi))

# === Crea LineString ordinati per y (o x) ===
linee = []
for punti in gruppi.values():
    if len(punti) < 2:
        continue
    punti.sort(key=lambda p: (p[1], p[0]))  # ordina per y, poi x
    linee.append(LineString(punti))

# === Salva in GeoJSON con EPSG:4979 ===
gdf = gpd.GeoDataFrame({}, geometry=linee, crs="EPSG:4979")
gdf.to_file("D:\prova_di_classificazione\9\linee_diagonali.geojson", driver="GeoJSON")
