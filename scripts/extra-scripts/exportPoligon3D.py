import laspy
import geojson
import simplekml

# Percorsi file
las_file_path = "D:\prova_di_classificazione\point_colorata_classificata\car.las"
geojson_line3d_out = "D:\prova_di_classificazione\shapes_3d\output_line_3d.geojson"
geojson_poly3d_out = "D:\prova_di_classificazione\shapes_3d\output_polygon_3d.geojson"
kml_line3d_out = "D:\prova_di_classificazione\shapes_3d\output_line_3d.kml"
kml_poly3d_out = "D:\prova_di_classificazione\shapes_3d\output_polygon_3d.kml"

# Lettura .las
las = laspy.read(las_file_path)
coords_3d = list(zip(las.x, las.y, las.z))

# --- GEOJSON LineString 3D ---
line_feature_3d = geojson.Feature(
    geometry=geojson.LineString(coords_3d),
    properties={"type": "3d_line"}
)

with open(geojson_line3d_out, "w") as f:
    geojson.dump(geojson.FeatureCollection([line_feature_3d]), f)

# --- GEOJSON Polygon 3D (chiuso)
if coords_3d[0] != coords_3d[-1]:
    coords_3d.append(coords_3d[0])

polygon_feature_3d = geojson.Feature(
    geometry=geojson.Polygon([coords_3d]),
    properties={"type": "3d_polygon"}
)

with open(geojson_poly3d_out, "w") as f:
    geojson.dump(geojson.FeatureCollection([polygon_feature_3d]), f)

# --- KML LineString 3D ---
kml_line3d = simplekml.Kml()
ls3d = kml_line3d.newlinestring(name="3D Line", coords=coords_3d)
ls3d.altitudemode = simplekml.AltitudeMode.absolute
ls3d.extrude = 0
ls3d.style.linestyle.width = 3
ls3d.style.linestyle.color = simplekml.Color.red
kml_line3d.save(kml_line3d_out)

# --- KML Polygon 3D ---
kml_poly3d = simplekml.Kml()
pg3d = kml_poly3d.newpolygon(name="3D Polygon", outerboundaryis=coords_3d)
pg3d.altitudemode = simplekml.AltitudeMode.absolute
pg3d.extrude = 1
pg3d.style.polystyle.color = simplekml.Color.changealphaint(100, simplekml.Color.blue)
kml_poly3d.save(kml_poly3d_out)

print("File 3D generati (KML e GeoJSON) con altitudine.")
