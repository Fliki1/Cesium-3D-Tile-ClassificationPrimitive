import laspy
import numpy as np
import geopandas as gpd
from shapely.geometry import LineString
from collections import defaultdict

# Carica i punti
las = laspy.read(r"D:\prova_di_classificazione\point_colorata_classificata\car.las")
x = np.array(las.x)
y = np.array(las.y)
z = np.array(las.z)

# Parametro: arrotondamento su y per definire "righe"
precisione_riga = 3  # più alto = meno righe (es. 3 = 0.001° di latitudine)

# Raggruppa i punti per valore di y arrotondato
gruppi = defaultdict(list)
for xi, yi, zi in zip(x, y, z):
    chiave_riga = round(yi, precisione_riga)
    gruppi[chiave_riga].append((xi, yi, zi))

# Crea linee ordinate per x dentro ogni gruppo
linee = []
for punti in gruppi.values():
    # Ordina i punti da sinistra a destra (x crescente)
    punti.sort(key=lambda p: p[0])
    if len(punti) >= 2:
        linee.append(LineString(punti))

# GeoDataFrame delle linee 3D
gdf_linee = gpd.GeoDataFrame({}, geometry=linee, crs="EPSG:4979")

# Salva
gdf_linee.to_file("D:\prova_di_classificazione\9\linee_parallele.geojson", driver="GeoJSON")
