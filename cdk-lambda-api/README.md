# CDK Deployment

## 준비 

### CDK 초기 생성

CDK 초기 생성은 아래와 같이 진행합니다. 

```java
mkdir cdk-lambda-api && cd cdk-lambda-api
cdk init app --language typescript
```

처음으로 CDK를 사용할 경우에는 [CDK Initiation](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md#cdk-initiation)에 따라 Bootstrap을 설정합니다. 

### Github 코드를 이용하는 경우

아래와 같이 CDK 폴더로 이동합니다. 

```java
git clone https://github.com/kyopark2014/image-classification-api-server
cd cdk-lambda-api
```

CDK V2.0을 설치합니다. 

```java
npm install aws-cdk-lib
```

아래와 같이 deply를 수행합니다.

```java
cdk deploy
```

### Cloud9에서 EBS 크기 변경

[Cloud9에서 EBS 크기 변경](https://github.com/kyopark2014/technical-summary/blob/main/resize.md)에 따라 cloud9의 볼륨을 조정할 수 있습니다.


