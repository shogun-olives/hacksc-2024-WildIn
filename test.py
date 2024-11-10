from helper import process
import os


def main() -> None:
    while True:
        fn = input(">>> ")
        fn = os.path.join("./data", fn)
        process(fn)


if __name__ == "__main__":
    main()
