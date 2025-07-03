import { cesiumAccessToken } from "./cesiumConfig.js";
Cesium.Ion.defaultAccessToken = cesiumAccessToken;

const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
});

(async () => {
    // 1. Carica il 3D Tileset
    const maresaTileSet = await Cesium.Cesium3DTileset.fromUrl("../tiled/tileset.json");
    viewer.scene.primitives.add(maresaTileSet);
    await maresaTileSet.readyPromise;
    viewer.zoomTo(maresaTileSet);

    // 2. Carica il GeoJSON
    const response = await fetch("../shapes/water_point_3D.geojson");
    const geojson = await response.json();

    // 3. Crea un GeometryInstance per ogni punto
    const sphereInstances = geojson.features.map((feature) => {
        const [lon, lat, height] = feature.geometry.coordinates;
        const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);

        return new Cesium.GeometryInstance({
            geometry: new Cesium.EllipsoidGeometry({
                radii: new Cesium.Cartesian3(0.01, 0.01, 0.01), // 1 cm
                vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                stackPartitions: 4, // default è 64
                slicePartitions: 4,
            }),            
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.YELLOW.withAlpha(0.6)
                ),
            },
        });
    });

    // 4. Crea la Classification Primitive
    const classificationPrimitive = new Cesium.ClassificationPrimitive({
        geometryInstances: sphereInstances,
        appearance: new Cesium.PerInstanceColorAppearance({
            translucent: true,
            closed: true,
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    });

    viewer.scene.primitives.add(classificationPrimitive);
})();
