import Metashape

def count_classified_points():
    doc = Metashape.app.document
    chunk = doc.chunk
    point_cloud = chunk.point_cloud

    if not point_cloud:
        print("Nessuna nuvola di punti presente.")
        return

    class_names = {
        0: "Unclassified",
        1: "Ground",
        2: "Low Vegetation",
        3: "Medium Vegetation",
        4: "High Vegetation",
        5: "Building",
        6: "Road",
        9: "Water"
    }

    print("Conteggio punti per classe:")
    for cls, count in sorted(point_cloud.point_count_by_class.items()):
        name = class_names.get(cls, f"Classe {cls}")
        print(f"{name}: {count} punti")

count_classified_points()