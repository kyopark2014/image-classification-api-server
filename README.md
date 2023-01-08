# 이미지 분류를 위한 API 서버 만들기 

RESNET-50를 사용하는 AWS의 [DLR(Deep Learning Runtime)](https://docs.aws.amazon.com/greengrass/v2/developerguide/dlr-component.html) 이미지 분류 모델을 이용하여 추론을 수행하고자 합니다. 

## Image Classification

event의 "body-json"으로 들어온 upload된 이미지를 base64로 encoding후 UTF8로 decoding하여 이미지 데이터를 추출 합니다. 
```java
data = base64.b64decode(event['body-json'])

# convert string of image data to uint8
encoded_img = np.fromstring(data, dtype = np.uint8)

image_data = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)
```

이미지 데이터를 json 포맷으로 바꾸어 추론(inference)를 수행하는 inference.py에 아래와 같이 요청합니다. 추론결과의 가장 높은 확율을 가지는 object의 label을 리턴합니다. 
```java
event = {
 'body': image_data
}

try:
 result = inference.handler(event,"")          
 return result['body'][0]['Label']
except:
traceback.print_exc()
```

## Result

아래와 같은 이미지를 업로드시 아래와 같은 결과를 얻습니다. 

![dog](https://user-images.githubusercontent.com/52392004/211182490-fa9f59ff-4435-407d-b877-d1399132a0ce.jpg)

Postman에서 업로드시 아래와 같이 수행합니다.

- Content-Type으로 "image/jpeg"을 입력합니다. 

![image](https://user-images.githubusercontent.com/52392004/211182527-c86878bb-a7be-47a9-93c2-4613924912bc.png)

- body에서 파일을 선택합니다. 

![image](https://user-images.githubusercontent.com/52392004/211182507-0cf39f97-40c7-41e7-9c76-0b0f3d5baabd.png)


이때의 결과는 아래와 같습니다. 

```java
{
    "statusCode": 200,
    "label": "Weimaraner"
}
```

## RESNET-50

### Demos

- [GluonCV ResNet50 Classifier Demo](https://aws.amazon.com/marketplace/ai/model-evaluation?productId=587dc453-b6d6-487e-abc4-133b4bd3a0ed)

- [RESNET-50 Demo](https://aws.amazon.com/marketplace/ai/model-evaluation?productId=cc879d3b-e759-4270-9afb-ceb50d2f7fe6)

 
 ## Reference 

[Github: neo-ai-dlr](https://github.com/neo-ai/neo-ai-dlr)

[DLR image classification model store](https://docs.aws.amazon.com/greengrass/v2/developerguide/dlr-image-classification-model-store-component.html)
