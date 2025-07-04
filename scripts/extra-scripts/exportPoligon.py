import laspy
import geojson
import simplekml

# Percorsi file
las_file_path = "D:\prova_di_classificazione\point_colorata_classificata\car.las"
geojson_out_path = "D:\prova_di_classificazione\shapes\output.geojson"
kml_out_path = "D:\prova_di_classificazione\shapes\output.kml"

# Lettura del file LAS
las = laspy.read(las_file_path)
points = zip(las.x, las.y, las.z)  # Assumendo che siano in WGS84

# --- GEOJSON ---
features = []
for x, y, z in points:
    point = geojson.Feature(
        geometry=geojson.Point((x, y)),  # GeoJSON usa lon, lat
        properties={"elevation": z}
    )
    features.append(point)

geojson_feature_collection = geojson.FeatureCollection(features)
with open(geojson_out_path, "w") as f:
    geojson.dump(geojson_feature_collection, f)

# --- KML ---
kml = simplekml.Kml()
for x, y, z in zip(las.x, las.y, las.z):
    pnt = kml.newpoint(coords=[(x, y, z)])
    pnt.altitudemode = simplekml.AltitudeMode.absolute
    pnt.description = f"Elevation: {z:.2f}"

kml.save(kml_out_path)

print("Conversione completata: GeoJSON e KML generati.")
