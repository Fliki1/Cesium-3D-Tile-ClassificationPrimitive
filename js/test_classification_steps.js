import { cesiumAccessToken, cameraCoordinatesMunicipio } from "./cesiumConfig.js";



Cesium.Ion.defaultAccessToken = cesiumAccessToken;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    }),
});


const municipioTileSet = await Cesium.Cesium3DTileset.fromUrl('../cesiumTile/municipio370/tileset.json');
viewer.scene.primitives.add(municipioTileSet);
await municipioTileSet.readyPromise;

// set camera position from Town Hall information
var cartographic = Cesium.Cartographic.fromDegrees(cameraCoordinatesMunicipio.longitude, cameraCoordinatesMunicipio.latitude, cameraCoordinatesMunicipio.height);
// set camera view
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height),
    orientation: {
        heading: Cesium.Math.toRadians(cameraCoordinatesMunicipio.heading), // Rotazione orizzontale (heading)
        pitch: Cesium.Math.toRadians(cameraCoordinatesMunicipio.pitch),    // Inclinazione (pitch)
        roll: Cesium.Math.toRadians(cameraCoordinatesMunicipio.roll)       // Rollio (roll)
    }
});


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
                    const flatCoordinates = coordinates.flat(1); // 1
                    //console.log("Polygon - Array di coordinate:", flatCoordinates);
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
// possibile sostituzione quando si tratteranno link
/* const pippo = await fetch("data/finestra.geojson")
const risposta = await pippo.json()
console.log(risposta.features[0].geometry.coordinates[0][0][0]) */

const coordinates = await loadGeoJSON("data/finestra.geojson");
//console.log(coordinates[0]);

// Supponiamo che 'coordinates[0]' contenga le coordinate in [lon, lat, alt]
const cartesianPoints = coordinates[0].map(coord =>
    //console.log(coord[0], coord[1], coord[2])
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2])
);
console.log(cartesianPoints)

// Calcola il piano che meglio approssima i punti
const plane = Cesium.Plane.fromPoints(cartesianPoints);
// La normale (già normalizzata) del piano
const normal = plane.normal;
console.log("Normal del piano:", normal);


