"""
Point count per individual classification
"""

import Metashape
import sys
import os

def count_classified_points(project_path):
    if not os.path.exists(project_path):
        print(f"Error: Project path '{project_path}' does not exist.")
        return

    # Open the specified project
    doc = Metashape.Document()
    doc.open(project_path)

    if not doc.chunks:
        print("No chunks found in the project.")
        return

    chunk = doc.chunk
    point_cloud = chunk.point_cloud

    if not point_cloud:
        print("No point cloud found in the selected chunk.")
        return

    class_names = {
        0: "Created",
        1: "Unclassified",
        2: "Ground",
        3: "Low Vegetation",
        4: "Medium Vegetation",
        5: "High Vegetation",
        6: "Building",
        7: "Low Point",
        8: "Model Key Point",
        9: "Water",
        10: "Rail",
        11: "Road Surface",
        12: "Overlap Points",
        13: "Wire Guard",
        14: "Wire Conductor",
        15: "Transmission Tower",
        16: "Wire Connector",
        17: "Bridge Deck",
        18: "High Noise",
        19: "Car",
        20: "Manmade"
    }

    print("Number of points for each class:")
    for cls, count in sorted(point_cloud.point_count_by_class.items()):
        name = class_names.get(cls, f"Class {cls}")
        print(f"{name}: {count} points")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <path_to_project.psx>")
    else:
        project_path = sys.argv[1]
        count_classified_points(project_path)
