from logging import INFO, StreamHandler, getLogger
from sys import stdout
from cv2 import imread
from numpy import load
import os
import traceback
from inference import handler   

import dlr
from dlr.counter.phone_home import PhoneHome                             
PhoneHome.disable_feature()   

logger = getLogger()
logger.setLevel(INFO)
#logging_handler = StreamHandler(stdout)
#logger.addHandler(logging_handler)

IMAGE_DIR = f'{os.getcwd()}/images'
print('IMAGE_DIR:', IMAGE_DIR)

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


def classifier(fname):
    image_data = load_image(os.path.join(IMAGE_DIR, fname))
    
    event = {
        'body': image_data
    }

    try:
        result = handler(event,"")          
        return result['body'][0]['Label']
    except:
        traceback.print_exc()
        
def main():
    fname = 'cat.jpeg'
    label = classifier(fname)
    print(fname + " -> "+ label)
        
    fname = 'dog.jpg'
    label = classifier(fname)
    print(fname + " -> "+ label)
    
    fname = 'macaw.jpg'
    label = classifier(fname)
    print(fname + " -> "+ label)
    
    fname = 'pelican.jpeg'
    label = classifier(fname)
    print(fname + " -> "+ label)    
        
if __name__ == '__main__':
    main()
