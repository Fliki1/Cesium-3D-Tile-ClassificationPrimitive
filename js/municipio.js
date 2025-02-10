import { cesiumAccessToken, cameraCoordinatesMunicipio } from "./cesiumConfig.js";


Cesium.Ion.defaultAccessToken = cesiumAccessToken;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    }),
});

// Fondamentale per sapere un minimo di coordinate dei modelli
// Aggiungi un listener per catturare la posizione e l'orientamento della camera ad ogni frame
/* viewer.scene.preRender.addEventListener(function (scene, time) {
    var cameraPosition = viewer.camera.positionCartographic;

    // Estrai latitudine, longitudine e altezza
    var latitude = Cesium.Math.toDegrees(cameraPosition.latitude);
    var longitude = Cesium.Math.toDegrees(cameraPosition.longitude);
    var height = cameraPosition.height;

    // Estrai l'orientamento della camera (heading, pitch, roll)
    var heading = viewer.camera.heading;  // Direzione orizzontale (in radianti)
    var pitch = viewer.camera.pitch;      // Inclinazione (in radianti)
    var roll = viewer.camera.roll;        // Rollio (in radianti)

    // Converte heading, pitch e roll in gradi per visualizzarli più facilmente
    var headingDegrees = Cesium.Math.toDegrees(heading);
    var pitchDegrees = Cesium.Math.toDegrees(pitch);
    var rollDegrees = Cesium.Math.toDegrees(roll);

    // Stampa le coordinate e l'orientamento ad ogni aggiornamento della scena
    console.log("Latitudine:", latitude, "Longitudine:", longitude, "Altezza:", height);
    console.log("Heading (gradi):", headingDegrees, "Pitch (gradi):", pitchDegrees, "Roll (gradi):", rollDegrees);
}); */




/* // Add Cesium OSM Buildings, a global 3D buildings layer.
const buildingTileset = await Cesium.createOsmBuildingsAsync();
viewer.scene.primitives.add(buildingTileset); */

// Carica il 3tz tileset locale
const municipioTileSet = await Cesium.Cesium3DTileset.fromUrl('../cesiumTile/municipio370/tileset.json');
// Aggiungi il tileset alla scena
viewer.scene.primitives.add(municipioTileSet);
await municipioTileSet.readyPromise;

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




/* // Caricamento del KML
const kmlResource = await Cesium.IonResource.fromAssetId(2920934);
const kmlDataSource = await Cesium.KmlDataSource.load(kmlResource, {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
});
viewer.dataSources.add(kmlDataSource); */

// Funzione per mostrare informazioni quando si clicca su un'entità
/* viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id; // Recupera l'entità cliccata
        if (Cesium.defined(entity)) {
            // Mostra una finestra modale o un popup con le informazioni
            const name = entity.name || "Sconosciuto";
            const description = entity.description?.getValue() || "Nessuna descrizione disponibile";

            alert(`Nome: ${name}\nDescrizione: ${description}`);
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK); */

