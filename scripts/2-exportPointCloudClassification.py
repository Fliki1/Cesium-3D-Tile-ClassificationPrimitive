"""
export point cloud if classification present
"""
import Metashape
import sys
import os

def exportPointClassification(project_path):
    if not os.path.exists(project_path):
        print(f"Error: Project path '{project_path}' does not exist.")
        return
    
    doc = Metashape.Document()
    doc.open(project_path)

    if not doc.chunks:
        print("No chunks found in the project.")
        return
    
    chunk = doc.chunk

    if not chunk.point_cloud:
        print("No point cloud found in the selected chunk.")
        return

    point_cloud = chunk.point_cloud

    if not point_cloud.point_count_by_class:
        print("Error: Point cloud does not contain classification information. Export aborted.")
        return

    # check classification points presence (class_id != 0)
    classified_points = sum(count for cls, count in point_cloud.point_count_by_class.items() if cls != 0)

    if classified_points == 0:
        print("Error: No classified points (class_id != 0) found in the point cloud. Export aborted.")
        return

    # Path export .las
    project_dir = os.path.dirname(project_path)
    export_path = os.path.join(project_dir, "cloud_classified.las")

    chunk.exportPointCloud(
        path=export_path,
        format=Metashape.PointCloudFormatLAS,
        save_point_color=True,
        save_point_classification=True
    )

    print(f"Exporting completed .LAS: {export_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <path_to_project.psx>")
    else:
        project_path = sys.argv[1]
        exportPointClassification(project_path)
