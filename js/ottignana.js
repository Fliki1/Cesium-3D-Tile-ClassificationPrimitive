import { cesiumAccessToken, url, cameraCoordinates } from "./cesiumConfig.js";


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


// Funzione per caricare e gestire ciascun tileset
async function loadTilesets(urls) {
    let lastTileset; // Variable to keep track of the last loaded tileset

    for (const name of urls) {
        try {
            const tilesetUrl = url[name];
            if (!tilesetUrl) {
                console.error(`URL not found for ${name}`);
                continue;
            }


            // Carica il tileset
            const tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetUrl);

            // Calcola il bounding sphere del tileset per posizionarlo correttamente
            const boundingSphere = tileset.boundingSphere;
            const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);

            // Definisci l'offset del modello in altezza
            const heightOffset = 0; // Cambia questo valore se necessario
            const newHeight = cartographic.height + heightOffset;

            // Trasla il modello al livello corretto
            const surfacePosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
            const newPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, newHeight);
            const translation = Cesium.Cartesian3.subtract(newPosition, surfacePosition, new Cesium.Cartesian3());
            const modelMatrix = Cesium.Matrix4.fromTranslation(translation);

            // Applica la nuova matrice al modello
            tileset.modelMatrix = modelMatrix;

            // Aggiungi il tileset alla scena
            viewer.scene.primitives.add(tileset);

            // Salva l'ultimo tileset caricato
            lastTileset = tileset;

            // Opzionalmente, disabilita il terreno nella zona del modello
            viewer.scene.globe.depthTestAgainstTerrain = false; // vedi attraverso il terreno

        } catch (error) {
            console.log(error);
        }
    }
}

// Esegui il caricamento dei tileset
loadTilesets(Object.keys(url));


// Usa le coordinate importate per teletrasportare la camera in Ottignana coordinate
var cartographic = Cesium.Cartographic.fromDegrees(cameraCoordinates.longitude, cameraCoordinates.latitude, cameraCoordinates.height);
// Imposta la posizione e l'orientamento della camera
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height),
    orientation: {
        heading: Cesium.Math.toRadians(cameraCoordinates.heading), // Rotazione orizzontale (heading)
        pitch: Cesium.Math.toRadians(cameraCoordinates.pitch),    // Inclinazione (pitch)
        roll: Cesium.Math.toRadians(cameraCoordinates.roll)       // Rollio (roll)
    }
});




/* // Caricamento del GeoJSON
const geoJsonResource = await Cesium.IonResource.fromAssetId(2920938);
const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonResource);
viewer.dataSources.add(geoJsonDataSource); */

// Caricamento del GeoJSON da Cesium Ion
const geoJsonResource = await Cesium.IonResource.fromAssetId(2920938);
const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(geoJsonResource);

// Estrarre tutte le entità dal GeoJSON
const entities = geoJsonDataSource.entities.values;

entities.forEach((entity) => {
    //console.log(entity.polygon)
    if (entity.polygon) {
        console.log(entity.id);
        const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
        const positions = hierarchy.positions;
        //console.log(positions)

        // Calcoliamo il centro del poligono per ancorare il modelMatrix
        let total = new Cesium.Cartesian3(0, 0, 0);
        positions.forEach((pos) => {
            Cesium.Cartesian3.add(total, pos, total);
        });
        let center = Cesium.Cartesian3.divideByScalar(total, positions.length, new Cesium.Cartesian3());
        console.log(center)

        // Creiamo la trasformazione che tiene conto della posizione e dell'orientamento
        const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);


        // Creazione della geometria del poligono
        const polygonGeometry = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        });

        // Creazione dell'istanza della geometria
        const geometryInstance = new Cesium.GeometryInstance({
            geometry: polygonGeometry,
            modelMatrix: modelMatrix, // Posizionamento corretto
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    new Cesium.Color(1.0, 0.0, 0.0) // Rosso 
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: entity.id,
        });

        // Aggiungiamo la classificazione alla scena
        viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: geometryInstance,
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

