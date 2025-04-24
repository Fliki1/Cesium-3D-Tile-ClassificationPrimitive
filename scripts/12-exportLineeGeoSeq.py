import laspy
import numpy as np
import geopandas as gpd
from shapely.geometry import LineString, Point
from collections import defaultdict

# === Parametri ===
path_las = r"D:\prova_di_classificazione\point_colorata_classificata\car.las"
precisione_diagonale = 3           # per raggruppare le diagonali
max_distanza = 1.0                 # distanza massima tra due punti consecutivi (in coordinate CRS)

# === Carica la nuvola ===
las = laspy.read(path_las)
x = np.array(las.x)
y = np.array(las.y)
z = np.array(las.z)

# === Raggruppa per diagonali: x - y ===
gruppi = defaultdict(list)
for xi, yi, zi in zip(x, y, z):
    chiave = round(xi - yi, precisione_diagonale)
    gruppi[chiave].append((xi, yi, zi))

# === Suddividi in segmenti coerenti ===
geometrie = []

for punti in gruppi.values():
    if len(punti) < 2:
        continue

    # Ordina i punti sulla diagonale
    punti.sort(key=lambda p: (p[1], p[0]))

    segmento_corrente = [punti[0]]
    for i in range(1, len(punti)):
        p1 = punti[i - 1]
        p2 = punti[i]
        dist = np.linalg.norm(np.array(p1[:2]) - np.array(p2[:2]))

        if dist <= max_distanza:
            segmento_corrente.append(p2)
        else:
            # chiudi il segmento se ha almeno 2 punti
            if len(segmento_corrente) >= 2:
                geometrie.append(LineString(segmento_corrente))
            elif len(segmento_corrente) == 1:
                geometrie.append(Point(segmento_corrente[0]))  # punto isolato
            segmento_corrente = [p2]

    # Aggiungi l’ultimo segmento
    if len(segmento_corrente) >= 2:
        geometrie.append(LineString(segmento_corrente))
    elif len(segmento_corrente) == 1:
        geometrie.append(Point(segmento_corrente[0]))

# === Esporta il risultato ===
gdf = gpd.GeoDataFrame({}, geometry=geometrie, crs="EPSG:4979")
gdf.to_file("D:\prova_di_classificazione\9\linee_diagonali_segmentate.geojson", driver="GeoJSON")
