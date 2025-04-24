import laspy

# Carica la nuvola
las = laspy.read("D:\prova_di_classificazione\point_colorata_classificata/cloud.las")

# Imposta colore rosso ai punti classificati come "Water" (9)
water_mask = las.classification == 9
las.red[water_mask] = 65535
las.green[water_mask] = 0
las.blue[water_mask] = 0

# Salva la nuova nuvola
las.write("D:\prova_di_classificazione\point_colorata_classificata\cloud_water_red.las")

print("Punti Water colorati in rosso.")