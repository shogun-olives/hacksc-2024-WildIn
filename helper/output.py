from .json_io import write_dict_to_json
from .draw import bounding_boxes
from .predict import find_edible
import config


def process(img_path: str, conf: int = config.CONF) -> str:
    """
    Process the image and save the output.

    :param fn: Path to the input image.
    :param conf: Confidence threshold

    :return: Path to the output json file.
    """
    # find the edible plants
    labels = find_edible(img_path, conf)

    # draw the bounding boxes
    fns = bounding_boxes(img_path, labels)

    plants = [
        {
            "name": key,
            "qty": len(value),
            "icon": f"{key.lower().replace(' ', '_')}.png",
            "labeled": fns[key],
            # TODO figure out description
            "description": "[TEMP VALUE]",
            "locations": value,
        }
        for key, value in labels.items()
    ]

    # TODO get recipes somehow
    recipes = []

    # write the results to a json file
    out_fn = f"{img_path[:img_path.rfind('.')]}.json"
    json_dict = {"unlabeled": img_path, "plants": plants, "recipes": recipes}
    write_dict_to_json(json_dict, out_fn)
    return out_fn
