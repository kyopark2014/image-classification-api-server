import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class CdkLambdaApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda for image classification
    const mlLambda = new lambda.DockerImageFunction(this, "lambda-api", {
      description: 'lambda function for image classification',
      functionName: 'lambda-api-server-for-image-classification',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../dlr-inference')),
      timeout: cdk.Duration.seconds(30),
    }); 

    // version
    const version = mlLambda.currentVersion;
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Dev',
      version,
    });
  }
}
