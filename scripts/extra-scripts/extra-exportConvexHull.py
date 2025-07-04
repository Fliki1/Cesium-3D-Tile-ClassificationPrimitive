import laspy
import simplekml
import geojson
import numpy as np
from scipy.spatial import ConvexHull

# File input/output
las_file_path = "D:\prova_di_classificazione\point_colorata_classificata\car.las"
geojson_out_path = "D:\prova_di_classificazione\shapes_convex_hull\simplified_polygon.geojson"
kml_out_path = "D:\prova_di_classificazione\shapes_convex_hull\simplified_polygon.kml"

# Leggi la nuvola di punti
las = laspy.read(las_file_path)
points = np.vstack((las.x, las.y, las.z)).T

# Calcola il Convex Hull
hull = ConvexHull(points)

# Ottieni i vertici del contorno
vertices = points[hull.vertices]

# Chiudiamo il poligono (primo punto == ultimo)
if not np.array_equal(vertices[0], vertices[-1]):
    vertices = np.vstack([vertices, vertices[0]])

# --- GeoJSON 3D ---
geojson_coords = [[list(coord) for coord in vertices]]  # GeoJSON vuole [ [ [lon, lat, alt], ... ] ]
feature = geojson.Feature(
    geometry=geojson.Polygon(geojson_coords),
    properties={"source": "convex_hull"}
)

with open(geojson_out_path, "w") as f:
    geojson.dump(geojson.FeatureCollection([feature]), f)

# --- KML 3D ---
kml = simplekml.Kml()
kml_coords = [tuple(coord) for coord in vertices]
poly = kml.newpolygon(name="Convex Hull 3D", outerboundaryis=kml_coords)
poly.altitudemode = simplekml.AltitudeMode.absolute
poly.extrude = 1
poly.style.polystyle.color = simplekml.Color.changealphaint(100, simplekml.Color.green)
kml.save(kml_out_path)

print("Poligono semplificato 3D generato (convex hull).")
