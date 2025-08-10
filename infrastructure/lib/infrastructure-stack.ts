import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaUrl from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class InfrastructureStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly jobAppTable: dynamodb.Table;
  public readonly userInfoHandlerLambda: lambda.Function;
  public readonly jobHandlerLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // COGNITO
    this.userPool = new cognito.UserPool(this, "AppTrackerUserPool", {
      userPoolName: "AppTrackerUserPool",
      selfSignUpEnabled: false,
      signInAliases: { username: true, email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "AppTrackerUserPoolClient",
      {
        userPoolClientName: "AppTrackerUserPoolClient",
        userPool: this.userPool,
        generateSecret: false, // must be false for frontend apps
      }
    );

    // DYNAMODB
    this.jobAppTable = new dynamodb.Table(this, "JobAppTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // switch to .RETAIN later. This destroys table on cdk destroy
    });

    // LAMBDA
    this.userInfoHandlerLambda = new lambda.Function(
      this,
      "UserInfoHandlerLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        functionName: "UserInfoHandlerLambda",
        description: "Lambda function to handle creating/fetching user data on login",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../backend/dist/lambdas")
        ),
        handler: "userInfoHandler.handler",
        environment: {
          TABLE_NAME: this.jobAppTable.tableName,
        },
      }
    );
    this.jobAppTable.grantReadWriteData(this.userInfoHandlerLambda);

    // TODO: add auth later
    const userInfoHandlerLambdaUrl = this.userInfoHandlerLambda.addFunctionUrl({
      authType: lambdaUrl.FunctionUrlAuthType.NONE, // No auth for now
      cors: {
        allowedOrigins: ["http://localhost:5173"],
        allowedMethods: [lambda.HttpMethod.POST, lambda.HttpMethod.GET],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    this.jobHandlerLambda = new lambda.Function(this, "JobHandlerLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: "JobHandlerLambda",
      description: "Lambda function to handle job application CRUD operations",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../backend/dist/lambdas")
      ),
      handler: "jobHandler.handler",
      environment: {
        TABLE_NAME: this.jobAppTable.tableName,
      },
    });
    this.jobAppTable.grantReadWriteData(this.jobHandlerLambda);

    // TODO: Add auth later
    const jobHandlerLambdaUrl = this.jobHandlerLambda.addFunctionUrl({
      authType: lambdaUrl.FunctionUrlAuthType.NONE, // No auth for now
      cors: {
        allowedOrigins: ["http://localhost:5173"],
        allowedMethods: [lambda.HttpMethod.POST, lambda.HttpMethod.PUT, lambda.HttpMethod.GET, lambda.HttpMethod.DELETE],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    // Output values for .env
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "ClientId", {
      value: this.userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "JobAppTableName", {
      value: this.jobAppTable.tableName,
    });

    new cdk.CfnOutput(this, "UserInfoHandlerLambdaName", {
      value: this.userInfoHandlerLambda.functionName,
    });

    new cdk.CfnOutput(this, "UserInfoHandlerLambdaUrl", {
      value: userInfoHandlerLambdaUrl.url,
    });

    new cdk.CfnOutput(this, "JobHandlerLambdaName", {
      value: this.jobHandlerLambda.functionName,
    });

    new cdk.CfnOutput(this, "JobHandlerLambdaUrl", {
      value: jobHandlerLambdaUrl.url,
    });
  }
}

export class InfraStack extends cdk.Stack {}
