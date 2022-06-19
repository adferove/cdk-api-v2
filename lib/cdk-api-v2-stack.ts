import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkApiV2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //DynamoDB Table
    const myTable = new Table(this, 'MyDemoTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'MyDemoTable',
    });

    //Lambda function
    const myFunction = new Function(this, 'MyDemoFunction', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('resources'),
      handler: 'app.handler',
      environment: {
        MY_TABLE: myTable.tableName,
      },
    });

    myTable.grantReadWriteData(myFunction);

    //API Gateway
    const myAPIGateway = new RestApi(this, 'myDemoAPIGateway');

    const myFunctionAPIGatewayIntegration = new LambdaIntegration(myFunction, {
      requestTemplates: { 'application/json': '{"statusCode":"200"}' },
    });

    myAPIGateway.root.addMethod('GET', myFunctionAPIGatewayIntegration);

    // example resource
    // const queue = new sqs.Queue(this, 'CdkApiV2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
