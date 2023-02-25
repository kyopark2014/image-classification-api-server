import cv2
import numpy as np
import traceback
import inference
import base64

def classifier(data):
    # convert string of image data to uint8
    encoded_img = np.fromstring(data, dtype = np.uint8)
    #print('encoded_img: ', encoded_img)

    # decode image
    image_data = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)
    #print('img: ', img_data)

    event = {
        'body': image_data
    }

    try:
        result = inference.handler(event,"")          
        return result['body'][0]['Label']
    except:
        traceback.print_exc()

def run(event, context):
    print('event: ', event)

    data = base64.b64decode(event['body'])
    label = classifier(data)
    print("label: "+ label)
       
    return {
        "statusCode": 200,
        "body": str(label)
    }  