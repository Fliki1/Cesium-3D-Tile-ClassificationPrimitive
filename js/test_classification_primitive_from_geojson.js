import { cesiumAccessToken } from "./cesiumConfig.js";

Cesium.Ion.defaultAccessToken = cesiumAccessToken;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    }),
});

// Carica il 3tz tileset locale
const maresaTileSet = await Cesium.Cesium3DTileset.fromUrl('../tiled/tileset.json');
// Aggiungi il tileset alla scena
viewer.scene.primitives.add(maresaTileSet);
await maresaTileSet.readyPromise;

viewer.zoomTo(maresaTileSet);

// Usa le coordinate importate per teletrasportare la camera in Ottignana coordinate
var cartographic = Cesium.Cartographic.fromDegrees(cameraCoordinatesMunicipio.longitude, cameraCoordinatesMunicipio.latitude, cameraCoordinatesMunicipio.height);
// Imposta la posizione e l'orientamento della camera
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height),
    orientation: {
        heading: Cesium.Math.toRadians(cameraCoordinatesMunicipio.heading), // Rotazione orizzontale (heading)
        pitch: Cesium.Math.toRadians(cameraCoordinatesMunicipio.pitch),    // Inclinazione (pitch)
        roll: Cesium.Math.toRadians(cameraCoordinatesMunicipio.roll)       // Rollio (roll)
    }
});




/* // Caricamento del GeoJSON
const geoJsonResource = await Cesium.IonResource.fromAssetId(2920938);
const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonResource);
viewer.dataSources.add(geoJsonDataSource); */

// Caricamento del GeoJSON da Cesium Ion
const geoJsonResource = await Cesium.IonResource.fromAssetId(2977967);
const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonResource);
//viewer.dataSources.add(geoJsonDataSource);

// Estrarre tutte le entità dal GeoJSON
const entities = geoJsonDataSource.entities.values;

entities.forEach((entity) => {
    //console.log(entity.polygon)
    if (entity.polygon) {
        console.log("id", entity.id);
        const center = new Cesium.Cartesian3(4493549.56, 934149.76, 4414690.42);
        const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);

        const boxDimensions = new Cesium.Cartesian3(2.16, 0.99, 1.98);

        const classificationPrimitive = viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: Cesium.BoxGeometry.fromDimensions({
                        dimensions: boxDimensions,
                        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                    }),
                    modelMatrix: modelMatrix,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            new Cesium.Color(1.0, 0.0, 0.0, 0.5) // Rosso semitrasparente
                        ),
                        show: new Cesium.ShowGeometryInstanceAttribute(true),
                    },
                    id: "geojson_volume",
                }),
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            })
        );

    }
});

