import laspy
import geojson
import simplekml

# Percorsi file
las_file_path = "D:\prova_di_classificazione\point_colorata_classificata\car.las"
geojson_lines_out = "D:\prova_di_classificazione\shapes\output_lines.geojson"
geojson_poly_out = "D:\prova_di_classificazione\shapes\output_polygon.geojson"
kml_lines_out = "D:\prova_di_classificazione\shapes\output_lines.kml"
kml_poly_out = "D:\prova_di_classificazione\shapes\output_polygon.kml"

# Lettura file LAS
las = laspy.read(las_file_path)
coords = list(zip(las.x, las.y))  # Ignoriamo Z per ora

# --- GEOJSON LineString ---
line_feature = geojson.Feature(
    geometry=geojson.LineString(coords),
    properties={"type": "line"}
)

with open(geojson_lines_out, "w") as f:
    geojson.dump(geojson.FeatureCollection([line_feature]), f)

# --- GEOJSON Polygon (chiudiamo il loop) ---
if coords[0] != coords[-1]:
    coords.append(coords[0])

polygon_feature = geojson.Feature(
    geometry=geojson.Polygon([coords]),  # GeoJSON richiede una lista di anelli
    properties={"type": "polygon"}
)

with open(geojson_poly_out, "w") as f:
    geojson.dump(geojson.FeatureCollection([polygon_feature]), f)

# --- KML LineString ---
kml_line = simplekml.Kml()
ls = kml_line.newlinestring(name="Line", coords=coords)
ls.style.linestyle.color = simplekml.Color.red
ls.style.linestyle.width = 3
kml_line.save(kml_lines_out)

# --- KML Polygon ---
kml_poly = simplekml.Kml()
pg = kml_poly.newpolygon(name="Polygon", outerboundaryis=coords)
pg.style.polystyle.color = simplekml.Color.changealphaint(100, simplekml.Color.blue)
kml_poly.save(kml_poly_out)

print("File generati: linee e poligoni in KML e GeoJSON.")
