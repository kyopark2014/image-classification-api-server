# 머신러닝(ML) 기반의 이미지 분류를 위한 API 서버 만들기 

RESNET-50를 사용하는 AWS의 [DLR(Deep Learning Runtime)](https://docs.aws.amazon.com/greengrass/v2/developerguide/dlr-component.html) 이미지 분류 모델을 이용하여 추론을 수행하고자 합니다. 

전체적인 Architecture는 아래와 같습니다. 이미지 분류를 사용하는 Client는 RESTful API로 syncronous하게 이미지를 분류할 수 있습니다. API요청시 API Gateway의 address를 Endpoint로 이용합니다. 이때 API 이름으로 "/classifier"를 이용하면 API Gateway와 연결된 Lambda로 요청이 event의 형태로 인입되어서, 이미지 분류를 위한 추론이 수행됩니다. Lambda는 Container로 배포되는데 이미지 추론에는 DLR Model을 사용합니다. Lambda Function URL이 아닌 API Gateway를 사용하는것은 외부에서 public하게 open되는 케이스를 고려하기 위함입니다. Lambda 및 API Gateway의 배포시에 AWS CDK와 ECR을 이용합니다. 

![image](https://user-images.githubusercontent.com/52392004/221357663-c4e1ba1d-b45f-411f-81a4-9b688feac83b.png)


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

Container 생성시 필요한 Dockerfile은 아래와 같습니다.

```java
FROM amazon/aws-lambda-python:3.8

RUN pip3 install --upgrade pip
RUN pip3 install scikit-build wheel 
RUN pip3 install opencv-python==4.6.0.66 

RUN python -m pip install joblib awsiotsdk pandas
RUN yum install libglvnd-glx -y
RUN python -m pip install dlr
RUN pip3 install dlr==1.6.0

WORKDIR /var/task/image-classifier

COPY inference.py /var/task
COPY classifier.py /var/task

COPY . .

CMD ["classifier.run"]
```

## 배포

인프라 설치는 아래와 같이 수행합니다.

```java
git clone https://github.com/kyopark2014/image-classification-api-server
cd cdk-lambda-api && npm install aws-cdk-lib@2.64.0 path 
cdk deploy
```

배포후 아래와 같은 값을 얻습니다.

![image](https://user-images.githubusercontent.com/52392004/221360112-bdb0e611-9971-4443-ac41-33ceefe8bee6.png)

여기서 ApiGatewayUrl의 주소는 "https://f8wr4q0nlj.execute-api.ap-northeast-2.amazonaws.com/dev/classifier" 와 같고 Web으로 접속할 주소는 "https://d1twzjcpb87z2n.cloudfront.net/classifier.html"임을 알 수 있습니다.

### Web에서 시험하기

아래와 같이 Web으로 접속해서 [Choose File]을 선택하여 이미지를 지정하고 [Send]를 선택하여 Classification을 요청합니다. 

![image](https://user-images.githubusercontent.com/52392004/221360058-4f57732e-8b51-4ae1-aa35-0c04dddb2ac7.png)


### Postman으로 시험하기 

Postman을 이용해 테스트시에 아래와 같이 수행합니다.

- Content-Type으로 "image/jpeg"을 입력합니다. 

![image](https://user-images.githubusercontent.com/52392004/211182527-c86878bb-a7be-47a9-93c2-4613924912bc.png)

- body에서 파일을 선택합니다. 

![image](https://user-images.githubusercontent.com/52392004/211182507-0cf39f97-40c7-41e7-9c76-0b0f3d5baabd.png)


아래와 같은 이미지를 업로드합니다. 

![dog](https://user-images.githubusercontent.com/52392004/211182490-fa9f59ff-4435-407d-b877-d1399132a0ce.jpg)


이때의 결과는 아래와 같습니다. 

```java
{
    "statusCode": 200,
    "label": "Weimaraner"
}
```

## 결과 예제

- "label": "cup"

<img src="https://user-images.githubusercontent.com/52392004/211224277-40571e68-aad7-4923-b18b-99745b3733c5.jpeg" width="400">


- "label": "coffee mug"

<img src="https://user-images.githubusercontent.com/52392004/211223986-2650ab6f-2b9f-4d02-b278-3ad149b6c5bf.jpeg" width="800">



- "label": "ashcan, trash can, garbage can, wastebin, ash bin, ash-bin, ashbin, dustbin, trash barrel, trash bin"

<img src="https://user-images.githubusercontent.com/52392004/211224017-39facb8e-24f2-42c6-8bbb-88fa160031dd.jpeg" width="400">



- "label": "sports car, sport car"

<img src="https://user-images.githubusercontent.com/52392004/211224064-7fa64af5-1924-4b73-b312-fdc1ba972c42.jpeg" width="800">



- "label": "crash helmet"

<img src="https://user-images.githubusercontent.com/52392004/211224133-bdaf1a6c-af2a-4db9-a461-3c73f13ec62f.jpeg" width="800">

## RESNET-50


### Demos

- [GluonCV ResNet50 Classifier Demo](https://aws.amazon.com/marketplace/ai/model-evaluation?productId=587dc453-b6d6-487e-abc4-133b4bd3a0ed)

- [RESNET-50 Demo](https://aws.amazon.com/marketplace/ai/model-evaluation?productId=cc879d3b-e759-4270-9afb-ceb50d2f7fe6)

 
 ## Reference 

[Github: neo-ai-dlr](https://github.com/neo-ai/neo-ai-dlr)

[DLR image classification model store](https://docs.aws.amazon.com/greengrass/v2/developerguide/dlr-image-classification-model-store-component.html)
