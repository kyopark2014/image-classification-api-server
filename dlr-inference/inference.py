from logging import INFO, DEBUG, StreamHandler, getLogger
from sys import stdout
from cv2 import resize
from dlr import DLRModel
from numpy import argsort, frombuffer, fromstring, load, uint8
from os import path
from ast import literal_eval
import os

logger = getLogger()
logger.setLevel(INFO)
logging_handler = StreamHandler(stdout)
logger.addHandler(logging_handler)

SCORE_THRESHOLD = 0.3
MAX_NO_OF_RESULTS = 5
SHAPE = (224, 224)

MODEL_DIR = f'{os.getcwd()}/model'
logger.info('MODEL_DIR: %s', MODEL_DIR)

# Read synset file
LABELS = path.join(MODEL_DIR, "synset.txt")
with open(LABELS, "r") as f:
    synset = literal_eval(f.read())

def load_model(model_dir):
    model = DLRModel(model_dir, dev_type='cpu', use_default_dlr=False)
    logger.debug('MODEL was loaded')
    return model

def predict_from_image(model, image_data):
    result = []
    try:
        # Run DLR to perform inference with DLC optimized model
        model_output = model.run(image_data)

        probabilities = model_output[0][0]
        sort_classes_by_probability = argsort(probabilities)[::-1]
        for i in sort_classes_by_probability[: MAX_NO_OF_RESULTS]:
            if probabilities[i] >= SCORE_THRESHOLD:
                result.append({"Label": str(synset[i]), "Score": str(probabilities[i])})
        
        logger.debug("result: {}".format(result))
        return result
    except Exception as e:
        logger.error("Exception occured during prediction: {}".format(e))

model = load_model(MODEL_DIR)

def handler(event, context):
    logger.debug('event: %s', event)

    image_data = event['body']
    cvimage = resize(image_data, SHAPE)

    if cvimage is not None:
        result = predict_from_image(model, cvimage)
        logger.debug('result: %s', result)
        
        return {
            'statusCode': 200,
            'body': result
        }   
    else:
        logger.error("Unable to capture an image using camera")
        exit(1)