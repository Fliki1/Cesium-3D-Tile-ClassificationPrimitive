import laspy
import sys
import os
import numpy as np
import json

def recolor_by_class(input_path, color_map, output_path=None):
    if not os.path.exists(input_path):
        print(f"Error: file '{input_path}' does not exist.")
        return

    las = laspy.read(input_path)
    classifications = las.classification

    total_colored = 0

    for cls_str, rgb in color_map.items():
        cls = int(cls_str)
        mask = classifications == cls
        count = np.count_nonzero(mask)
        if count == 0:  # no point on selected class: skip
            print(f"No point found on {cls} class")
            continue

        las.red[mask] = rgb[0]
        las.green[mask] = rgb[1]
        las.blue[mask] = rgb[2]
        print(f"{count} point of {cls} colored in RGB {rgb}.")


    if not output_path:
        output_path = input_path.replace(".las", "_recolored.las")

    las.write(output_path)
    print(f"Result in: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Use: python script.py <cloud.las> <color_map.json>")
        sys.exit(1)

    input_las = sys.argv[1]
    json_path = sys.argv[2]

    with open(json_path, "r") as f:
        color_map = json.load(f)

    recolor_by_class(
        input_path=input_las,
        color_map=color_map
    )
