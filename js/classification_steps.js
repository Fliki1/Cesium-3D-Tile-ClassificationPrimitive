import { cesiumAccessToken, cameraCoordinatesMunicipio } from "./cesiumConfig.js";



Cesium.Ion.defaultAccessToken = cesiumAccessToken;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    }),
});


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


/* fetch("data/finestra.geojson")
    .then(response => response.json())
    .then(data => {
        if (!data.features || !Array.isArray(data.features)) {
            throw new Error("Formato GeoJSON non valido");
        }

        // Estrai tutte le coordinate e le appiattisci
        const coordinatesArray = data.features
            .map(feature => feature.geometry?.coordinates)
            .flat(2); // Appiattisce i primi due livelli di annidamento

        console.log("Array di coordinate:", coordinatesArray);
    })
    .catch(error => console.error("Errore nel caricamento:", error)); */

// lettura locale file geojson e sua analisi struttura tipo
function loadGeoJSON(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.features || !Array.isArray(data.features)) {
                throw new Error("Formato GeoJSON non valido");
            }

            const extractedCoordinates = [];

            data.features.forEach(feature => {
                if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
                    console.warn("Feature senza geometria valida:", feature);
                    return;
                }

                const { type, coordinates } = feature.geometry;

                if (type === "Polygon") {
                    // Un Polygon ha coordinate annidate, appiattiamo il primo livello
                    const flatCoordinates = coordinates.flat(1);
                    console.log("Polygon - Array di coordinate:", flatCoordinates);
                    extractedCoordinates.push(flatCoordinates);
                }
                else if (type === "MultiPolygon") {
                    console.warn("⚠️ Attenzione: Il file contiene un MultiPolygon, che ha più insiemi di coordinate!");
                    console.log("MultiPolygon - Coordinate originali:", coordinates);
                    extractedCoordinates.push(coordinates);
                }
                else {
                    console.warn(`Geometria di tipo non gestito: ${type}`);
                }
            });

            return extractedCoordinates;
        })
        .catch(error => {
            console.error("Errore nel caricamento:", error);
            return null;
        });
}


const coordinates = await loadGeoJSON("data/finestra.geojson");
/*
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
}); */



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

