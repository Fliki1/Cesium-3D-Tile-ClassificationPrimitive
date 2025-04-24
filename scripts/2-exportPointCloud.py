import Metashape

doc = Metashape.app.document
chunk = doc.chunk

chunk.exportPointCloud(
    path="D:\prova_di_classificazione\point_colorata_classificata\cloud.las",  # Cambia il path se serve
    format=Metashape.PointCloudFormatLAS,
    save_point_color=True,
    save_point_classification=True
)

print("Esportazione .LAS completata.")