from PIL import Image, ImageDraw


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
    fns = {}
    for label, boxes in labels.items():
        image = Image.open(img_path)
        draw = ImageDraw.Draw(image)
        for box in boxes:
            draw.rectangle(box, outline="red", width=2)

        fn = (
            f"{img_path[:img_path.rfind(".")]}_{label}.png"
            if out_path is None
            else f"{out_path[:out_path.rfind(".")]}_{label}.png"
        )
        fns[label] = fn
        image.save(fn)

    return fns
