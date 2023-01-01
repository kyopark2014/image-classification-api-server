from logging import INFO, StreamHandler, getLogger
from sys import stdout
from cv2 import VideoCapture, destroyAllWindows, imdecode, imread, resize
from dlr import DLRModel
from numpy import argsort, frombuffer, fromstring, load, uint8
from os import environ, path
from ast import literal_eval
import os
import traceback
import json
import time

import dlr
from dlr.counter.phone_home import PhoneHome                             
PhoneHome.disable_feature()   

logger = getLogger()
logger.setLevel(INFO)
#logging_handler = StreamHandler(stdout)
#logger.addHandler(logging_handler)

IMAGE_DIR = f'{os.getcwd()}/images'
logger.info('IMAGE_DIR: %s', IMAGE_DIR)

def load_image(image_path):
    # Case insenstive check of the image type.
    img_lower = image_path.lower()
    if (
        img_lower.endswith(
            ".jpg",
            -4,
        )
        or img_lower.endswith(
            ".png",
            -4,
        )
        or img_lower.endswith(
            ".jpeg",
            -5,
        )
    ):
        try:
            image_data = imread(image_path)
        except Exception as e:
            logger.error(
                "Unable to read the image at: {}. Error: {}".format(image_path, e)
            )
            exit(1)
    elif img_lower.endswith(
        ".npy",
        -4,
    ):
        image_data = load(image_path)
    else:
        logger.error("Images of format jpg,jpeg,png and npy are only supported.")
        exit(1)
    return image_data

def main():
    image = load_image(path.join(IMAGE_DIR, 'cat.jpeg'))

    while True:
        time.sleep(10)

        try:
            results = handler(image,"")          
            print('result: ' + json.dumps(results['body']))
        except:
            traceback.print_exc()
        
if __name__ == '__main__':
    main()
