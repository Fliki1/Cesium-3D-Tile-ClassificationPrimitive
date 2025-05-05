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
        0: "Unclassified",
        1: "Ground",
        2: "Low Vegetation",
        3: "Medium Vegetation",
        4: "High Vegetation",
        5: "Building",
        6: "Road",
        9: "Water"
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
