from .draw import bounding_boxes
from .predict import find_edible
from .json_io import read_json_to_dict
import config
import os


def process(img_path: str, conf: int = config.CONF) -> dict:
    """
    Process the image and save the output.

    :param fn: Path to the input image.
    :param conf: Confidence threshold

    :return: Path to the output json file.
    """
    # error
    if not os.path.exists(img_path):
        return {"error": "File not found."}

    # find the edible plants
    labels = find_edible(img_path, conf)

    # draw the bounding boxes
    fns = bounding_boxes(img_path, labels)

    # plant data
    descriptions = read_json_to_dict(config.MODEL_CLASSES)["categories"]
    plants = [
        {
            "name": key,
            "qty": len(value),
            "icon": f"{key.lower().replace(' ', '_')}.png",
            "labeled": fns[key],
            "description": descriptions[key],
            "locations": value,
        }
        for key, value in labels.items()
    ]

    # recipe data
    recipes = read_json_to_dict(config.RECIPES)["recipes"]
    recipes = [
        recipe
        for recipe in recipes
        if any(plant["name"] in recipe["plants"] for plant in plants)
    ]

    # returns dictionary
    return {"unlabeled": img_path, "plants": plants, "recipes": recipes}
