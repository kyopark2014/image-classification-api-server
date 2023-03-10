import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";

const debug = false;

export class CdkLambdaApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stage = "dev";

    // S3 
    const s3Bucket = new s3.Bucket(this, "storage",{
      // bucketName: bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    if(debug) {      
      new cdk.CfnOutput(this, 'bucketName', {
        value: s3Bucket.bucketName,
        description: 'The nmae of bucket',
      });
      new cdk.CfnOutput(this, 's3Arn', {
        value: s3Bucket.bucketArn,
        description: 'The arn of s3',
      });
      new cdk.CfnOutput(this, 's3Path', {
        value: 's3://'+s3Bucket.bucketName,
        description: 'The path of s3',
      });
    }

    // copy web application files into s3 bucket
    new s3Deploy.BucketDeployment(this, "upload-HTM", {
      sources: [s3Deploy.Source.asset("../html")],
      destinationBucket: s3Bucket,
    });

    // CloudFront
    const distribution = new cloudFront.Distribution(this, 'cloudfront', {
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
        allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cloudFront.PriceClass.PRICE_CLASS_200,  
    });
    if(debug) {      
      new cdk.CfnOutput(this, 'distributionDomainName', {
        value: distribution.domainName,
        description: 'The domain name of the Distribution',
      });
    } 

    // Create Lambda for image classification
    const mlLambda = new lambda.DockerImageFunction(this, "lambda-api", {
      description: 'lambda function for image classification',
      functionName: 'lambda-api-server-for-image-classification',
      memorySize: 512,
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../dlr-inference')),
      timeout: cdk.Duration.seconds(30),
    }); 
    mlLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));

    // version
    const version = mlLambda.currentVersion;
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: stage,
      version,
    });

    // role
    const role = new iam.Role(this, "ApiRole-Classification", {
      roleName: "api-role-classification",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });
    role.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    }));
    role.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaExecute',
    }); 

    // access log
    const logGroup = new logs.LogGroup(this, 'AccessLogs', {
      logGroupName: `/aws/api-gateway/accesslog-image-classifier`, 
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    logGroup.grantWrite(new iam.ServicePrincipal('apigateway.amazonaws.com')); 

    // api Gateway    
    const api = new apiGateway.RestApi(this, 'image-classification-api-server', {
      description: 'API Gateway for image classification',
      endpointTypes: [apiGateway.EndpointType.REGIONAL],
      binaryMediaTypes: ['image/*'], 
      deployOptions: {
        stageName: stage,
        
        // logging for debug
        loggingLevel: apiGateway.MethodLoggingLevel.INFO, 
        dataTraceEnabled: true,

        // trace access log
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),    
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields()  
      },
    });   
    
    // POST method
    const resourceName = "classifier";
    const classifier = api.root.addResource(resourceName);
    classifier.addMethod('POST', new apiGateway.LambdaIntegration(mlLambda, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:true, 
    }), {
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    }); 

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url+resourceName,
      description: 'The url of API Gateway',
    });  

    // cloudfront setting for api gateway    
    distribution.addBehavior("/classifier", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,  
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });    

    new cdk.CfnOutput(this, 'ClassifierUrl', {
      value: 'https://'+distribution.domainName+'/classifier.html',
      description: 'The url of file classifier',
    });

    new cdk.CfnOutput(this, 'UpdateCommend', {
      value: 'aws s3 cp ./html/classifier.html '+'s3://'+s3Bucket.bucketName,
      description: 'commend to upload the html',
    });      
  }
}
