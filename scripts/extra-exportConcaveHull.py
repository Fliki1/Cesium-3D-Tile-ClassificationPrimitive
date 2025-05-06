import laspy
import numpy as np
import simplekml
import geojson
import alphashape
from shapely.geometry import Polygon, MultiPolygon

# === Parametri ===
las_file_path = "D:\prova_di_classificazione\point_colorata_classificata\car.las"
geojson_out_path = "D:\prova_di_classificazione\shapes_concave_hull\concave_polygon.geojson"
kml_out_path = "D:\prova_di_classificazione\shapes_concave_hull\concave_polygon.kml"
alpha = 10.0  # Più alto = più semplificato, più basso = più dettagliato

# === Carica nuvola di punti ===
las = laspy.read(las_file_path)
points = np.vstack((las.x, las.y, las.z)).T  # Nx3 array

# Proiettiamo su XY per il contorno
points_2d = points[:, :2]

# === Calcolo contorno concavo (alpha shape) ===
concave_shape = alphashape.alphashape(points_2d, alpha)

# Estrai vertici 2D
if isinstance(concave_shape, Polygon):
    coords_2d = list(concave_shape.exterior.coords)

elif isinstance(concave_shape, MultiPolygon):
    largest = max(concave_shape.geoms, key=lambda p: p.area)
    coords_2d = list(largest.exterior.coords)

else:
    raise ValueError("La forma concava risultante non è un poligono valido.")

# === Associa ogni punto 2D a un'altezza (Z) ===
def find_nearest_z(xy, all_xyz):
    diffs = np.linalg.norm(all_xyz[:, :2] - xy, axis=1)
    return all_xyz[np.argmin(diffs), 2]

coords_3d = [(x, y, find_nearest_z(np.array([x, y]), points)) for x, y in coords_2d]

# === Salva GeoJSON ===
geojson_coords = [[list(coord) for coord in coords_3d]]  # GeoJSON 3D Polygon
feature = geojson.Feature(
    geometry=geojson.Polygon(geojson_coords),
    properties={"type": "concave_hull", "alpha": alpha}
)

with open(geojson_out_path, "w") as f:
    geojson.dump(geojson.FeatureCollection([feature]), f)

# === Salva KML ===
kml = simplekml.Kml()
kml_coords = [tuple(coord) for coord in coords_3d]
poly = kml.newpolygon(name="Concave Hull 3D", outerboundaryis=kml_coords)
poly.altitudemode = simplekml.AltitudeMode.absolute
poly.extrude = 1
poly.style.polystyle.color = simplekml.Color.changealphaint(100, simplekml.Color.green)
kml.save(kml_out_path)

print(f"✅ Poligono concavo 3D salvato in:\n- {geojson_out_path}\n- {kml_out_path}")
