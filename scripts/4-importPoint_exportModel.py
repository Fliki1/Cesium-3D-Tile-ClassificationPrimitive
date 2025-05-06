import Metashape
import sys
import os

def import_pointCloudClass_and_build_model(project_path, las_path, output_path=None):
    if not os.path.exists(project_path):
        print(f"Error: project '{project_path}' does not exist.")
        return

    if not os.path.exists(las_path):
        print(f"Error: cloud point '{las_path}' does not exist.")
        return

    doc = Metashape.Document()
    doc.open(project_path)
    chunk = doc.chunk

    print(f"Import cloud point: {las_path}")
    chunk.importPointCloud(
        path=las_path,
        format=Metashape.PointCloudFormatLAS,
        replace_asset= False
    )

    chunk.buildModel(
        source_data=Metashape.PointCloudData,
        surface_type=Metashape.Arbitrary,
        interpolation=Metashape.EnabledInterpolation,
        face_count=Metashape.HighFaceCount
    )
    doc.save()

    if not output_path:
        output_path = os.path.dirname(project_path)

    chunk.exportModel(os.path.join(output_path, 'model.obj'))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <project.psx> <cloud.las> [output_path]")
        sys.exit(1)

    project_path = sys.argv[1]
    las_path = sys.argv[2]

    import_pointCloudClass_and_build_model(project_path, las_path)
