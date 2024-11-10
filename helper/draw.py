from PIL import Image, ImageDraw
import config
import os


def bounding_boxes(
    img_path: str, labels: dict[str : list[list[int]]], out_path: str = None
) -> dict[str:str]:
    """
    Draws bounding boxes on an image and saves the result.

    :param img_path: Path to the input image.
    :param labels: Dictionary containing the labels and bounding boxes.
    :param out_path: Path to save the output image.
    If None, the output image will be saved in original_output.png
    :return: Path to the output image.
    """
    # create download directory if it doesn't exist
    os.mkdir(config.DOWNLOAD_DIR)

    # draw the bounding boxes
    fns = {}
    for label, boxes in labels.items():
        image = Image.open(img_path)
        draw = ImageDraw.Draw(image)
        for box in boxes:
            draw.rectangle(box, outline="red", width=2)

        if out_path is None:
            fn = os.path.basename(img_path)
            fn = f"{fn[:fn.rfind(".")]}_{label}.png"
            fn = os.path.join(config.DOWNLOAD_DIR, fn)
        else:
            fn = out_path

        fns[label] = fn
        image.save(fn)

    return fns
