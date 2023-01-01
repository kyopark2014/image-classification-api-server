# DLR을 이용한 이미지 분류 추론

[DLR(Deep Learning Runtime)](https://docs.aws.amazon.com/greengrass/v2/developerguide/dlr-component.html) 이미지 분류 모델을 이용하여 추론을 수행하고자 합니다. 

## Cloud9을 이용하여 추론 동작 확인하기 

1. [Cloud9 Console](https://ap-northeast-2.console.aws.amazon.com/cloud9control/home?region=ap-northeast-2#/create)에서 Cloud9을 생성합니다. 

2. Cloud9이 생성이되면 필요한 라이브러리를 설치합니다. Cloud9에서 설정한 Platform에 따라 아래와 같이 Ubuntu 18.4와 Amazon Linux 2의 설정이 상이합니다.

#### Ubuntu 18.4

Ubuntu인 경우에 아래와 같은 라이브러리를 설치합니다. OpenCV은 gluoncv 또는 opencv-python을 설치하면 됩니다.

```java
sudo apt-get install libgl1 -y

pip3 install --upgrade pip
pip3 install scikit-build wheel gluoncv dlr

pip install dlr 
```

#### Amazon Linux 2

Amazon Linux인 경우에 아래와 같이 필요한 라이브러리를 설치합니다. 

```java
sudo yum update -y
sudo yum install libglvnd-glx -y

pip3 install --upgrade pip
pip3 install scikit-build wheel gluoncv dlr

sudo pip install dlr
```

3) 추론을 위한 파일들을 다운로드 합니다. 

```java
git clone https://github.com/kyopark2014/image-classification-via-iot-greengrass
cd image-classification-via-iot-greengrass/dlr-inference/
```

4) 아래와 같이 추론을 수행합니다.

```java
python3 inference-test.py 
```

이때의 결과는 아래와 같습니다. 

```java
MODEL_DIR: /home/ec2-user/environment/image-classification-via-iot-greengrass/dlr-inference/model
IMAGE_DIR: /home/ec2-user/environment/image-classification-via-iot-greengrass/dlr-inference/images
cat.jpeg -> tabby, tabby cat
dog.jpg -> Weimaraner
macaw.jpg -> macaw
pelican.jpeg -> pelican
```

결과의 한 예로서 "cat.jpeg"을 보면, 아래와 같이 예측(Predict)되었고, 가장 높은 값을 가지는  "tabby, tabby cat"로 추론 결과를 얻습니다.

```java
result: {'Label': 'tabby, tabby cat', 'Score': '7.7391315'}
result: {'Label': 'Egyptian cat', 'Score': '6.956063'}
result: {'Label': 'tiger cat', 'Score': '6.775721'}
result: {'Label': 'doormat, welcome mat', 'Score': '5.3863106'}
result: {'Label': 'plastic bag', 'Score': '4.5193176'}
```

태스트에 사용한 이미지는 아래와 같습니다.

<img src="https://user-images.githubusercontent.com/52392004/209852850-4f3792e8-2423-4689-83ed-3b98881616d7.png" width="400">


## Container로 빌드하여 테스트하기

추론을 적용할때는 Container로 배포하고자 합니다. 먼저, 아래와 같이 Container 이미지를 빌드합니다. 

```java
docker build -t dlr:v1 .
```

빌드된 이미지를 확인합니다. 

```java
docker images
```

Docker Container를 실행합니다. 

```java
docker run -d -p 8080:8080 dlr:v1
```

container 정보를 확인합니다. 

```java
docker ps

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES
41e297948511   dlr:v1   "/lambda-entrypoint.…"   6 seconds ago   Up 4 seconds   0.0.0.0:8080->8080/tcp   stupefied_carson
```

Bash shell로 접속합니다.

```java
docker exec -it 41e297948511 /bin/bash
```

아래와 같이 "inference-test.py"을 이용하여 정상적으로 추론이 되는지 확인합니다.

```java
python3 inference-test.py 
```

이때의 결과는 아래와 같이 추론을 통해 정상적으로 분류가 이루어집니다. 

```java
MODEL_DIR: /var/task/dlr/model
2022-12-29 20:47:13,109 INFO Could not find libdlr.so in model artifact. Using dlr from /var/lang/dlr/libdlr.so
IMAGE_DIR: /var/task/dlr/images
cat.jpeg -> tabby, tabby cat
dog.jpg -> Weimaraner
macaw.jpg -> macaw
pelican.jpeg -> pelican
```

## Reference 

[Github: neo-ai-dlr](https://github.com/neo-ai/neo-ai-dlr)
