import { cesiumAccessToken } from "./cesiumConfig.js";
Cesium.Ion.defaultAccessToken = cesiumAccessToken;

const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
});

(async () => {
    // 1. Load 3D Tileset
    const tileSet = await Cesium.Cesium3DTileset.fromUrl("../tiled/tileset.json");
    viewer.scene.primitives.add(tileSet);
    await tileSet.readyPromise;
    viewer.zoomTo(tileSet);

    // 2. Load DenseCloud coordinates GeoJSON
    const response = await fetch("../shapes/cloud_Water_3D.geojson");
    const geojson = await response.json();

    // 3. Create a GeometryInstance for each point coordinates
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

    // 4. Create Classification Primitive
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
