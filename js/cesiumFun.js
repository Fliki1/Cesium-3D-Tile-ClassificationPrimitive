// funzione di add modelli glb
const createModel = (viewer, url, x, y, height) => {
    const position = Cesium.Cartesian3.fromDegrees(x, y, height);
    viewer.entities.add({
        name: url,
        position: position,
        model: {
            uri: url,
        },
    });
};

async function createVolumeFromGeoJSON(assetId, color = Cesium.Color.RED.withAlpha(0.5)) {
    // Caricamento del GeoJSON da Cesium Ion
    const geoJsonResource = await Cesium.IonResource.fromAssetId(assetId);
    const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonResource);

    // Estrarre i dati dal GeoJSON
    const entities = geoJsonDataSource.entities.values;
    if (entities.length === 0) {
        console.error("Nessun poligono trovato nel GeoJSON.");
        return;
    }

    // Consideriamo il primo poligono
    const entity = entities[0];

    if (!entity.polygon) {
        console.error("L'entità non contiene un poligono.");
        return;
    }

    // Ottenere i vertici del poligono
    const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
    const positions = hierarchy.positions;

    // Calcolare il centro del poligono
    let total = new Cesium.Cartesian3(0, 0, 0);
    positions.forEach(pos => Cesium.Cartesian3.add(total, pos, total));
    const center = Cesium.Cartesian3.divideByScalar(total, positions.length, new Cesium.Cartesian3());

    // Determinare la bounding box
    const minPoint = new Cesium.Cartesian3(...positions[0].toArray());
    const maxPoint = new Cesium.Cartesian3(...positions[0].toArray());

    positions.forEach(pos => {
        Cesium.Cartesian3.minimumByComponent(minPoint, pos, minPoint);
        Cesium.Cartesian3.maximumByComponent(maxPoint, pos, maxPoint);
    });

    const dimensions = new Cesium.Cartesian3(
        maxPoint.x - minPoint.x,
        maxPoint.y - minPoint.y,
        maxPoint.z - minPoint.z
    );

    // Creazione della modelMatrix
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    // Creazione della ClassificationPrimitive
    const classificationPrimitive = viewer.scene.primitives.add(
        new Cesium.ClassificationPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: Cesium.BoxGeometry.fromDimensions({
                    dimensions: dimensions,
                    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                }),
                modelMatrix: modelMatrix,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
                    show: new Cesium.ShowGeometryInstanceAttribute(true),
                },
                id: "geojson_volume",
            }),
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
    );

    return classificationPrimitive;
}

export { createModel, createVolumeFromGeoJSON }