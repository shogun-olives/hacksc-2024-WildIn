import torch
import config
import pandas as pd
import pathlib

# FIXME stupid workaround for stupid pytorch
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

# initialize model
model = torch.hub.load(
    "yolov5",
    "custom",
    path=config.MODEL_PATH,
    source="local",
    force_reload=True,
)
model.eval()


def find_edible(
    img_path: str, conf: float = config.CONF
) -> dict[str : list[list[int]]]:
    """
    Finds all of the edible plants in the given image.

    :param img_path: path to target image
    :param conf: minimum confidence to accept (default config.CONF)
    :return: dict: key=[plant name] value=[[x-start, x-end, y-start, y-end]]
    """
    # get the prediction as a pd.DataFrame
    results = model([img_path])
    df: pd.DataFrame = results.pandas().xyxy[0]

    # format as dictionary
    grouped = df[df["confidence"] >= conf].groupby("name")

    result = {
        key: [
            [row["xmin"], row["ymin"], row["xmax"], row["ymax"]]
            for _, row in data.iterrows()
        ]
        for key, data in grouped
    }

    return result
