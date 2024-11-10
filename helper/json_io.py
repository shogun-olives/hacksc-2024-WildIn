import json


def read_json_to_dict(fn: str) -> dict:
    """
    Reads a JSON file and returns its contents as a dictionary.

    :param file_path: Path to the JSON file.
    :return: Dictionary containing the JSON data.
    """
    with open(fn, "r") as file:
        data = json.load(file)
    return data


def write_dict_to_json(data: dict, fn: str) -> None:
    """
    Writes a dictionary to a JSON file.

    :param data: Dictionary to write to the file.
    :param file_path: Path to the JSON file.
    """
    with open(fn, "w") as file:
        json.dump(data, file, indent=4)
    return None
