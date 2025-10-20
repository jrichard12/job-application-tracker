import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaUrl from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

export class InfrastructureStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly jobAppTable: dynamodb.Table;
  public readonly userInfoHandlerLambda: lambda.Function;
  public readonly jobHandlerLambda: lambda.Function;
  public readonly notificationSenderLambda: lambda.Function;

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
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    // USER HANDLER LAMBDA
    this.userInfoHandlerLambda = new lambda.Function(
      this,
      "UserInfoHandlerLambda",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        functionName: "UserInfoHandlerLambda",
        description:
          "Lambda function to handle creating/fetching user data on login",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../backend/dist/userInfo")
        ),
        handler: "userInfo/handler.handler",
        environment: {
          TABLE_NAME: this.jobAppTable.tableName,
          USER_POOL_ID: this.userPool.userPoolId,
          CLIENT_ID: this.userPoolClient.userPoolClientId,
        },
      }
    );
    this.jobAppTable.grantReadWriteData(this.userInfoHandlerLambda);

    const userInfoHandlerLambdaUrl = this.userInfoHandlerLambda.addFunctionUrl({
      authType: lambdaUrl.FunctionUrlAuthType.NONE, // Using JWT verification in function
    });

    // JOB HANDLER LAMBDA
    this.jobHandlerLambda = new lambda.Function(this, "JobHandlerLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      functionName: "JobHandlerLambda",
      description: "Lambda function to handle job application CRUD operations",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../backend/dist/job")
      ),
      handler: "job/handler.handler",
      environment: {
        TABLE_NAME: this.jobAppTable.tableName,
        USER_POOL_ID: this.userPool.userPoolId,
        CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
    });
    this.jobAppTable.grantReadWriteData(this.jobHandlerLambda);

    const jobHandlerLambdaUrl = this.jobHandlerLambda.addFunctionUrl({
      authType: lambdaUrl.FunctionUrlAuthType.NONE, // Using JWT verification in function
    });

    // NOTIFICATION SENDER LAMBDA
    this.notificationSenderLambda = new lambda.Function(this, "NotificationSenderLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      functionName: "NotificationSenderLambda",
      description: "Lambda function to send deadline notifications to users",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../backend/dist/notificationSender")
      ),
      handler: "notificationSender/handler.handler",
      environment: {
        TABLE_NAME: this.jobAppTable.tableName,
        SES_FROM_EMAIL: "app.tracker.25@gmail.com",
      },
    });
    this.jobAppTable.grantReadData(this.notificationSenderLambda);

    // SES permissions
    this.notificationSenderLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        resources: ["*"],
      })
    );

    // SCHEDULE NOTIFICATION LAMBDA (9 AM EST)
    const notificationRule = new events.Rule(this, 'DailyNotificationRule', {
      description: 'Trigger notification lambda daily to check for upcoming job deadlines',
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '13', // 13 UTC = 9 AM EST
        day: '*',
        month: '*',
        year: '*'
      })
    });
    notificationRule.addTarget(new targets.LambdaFunction(this.notificationSenderLambda));

    // OUTPUT
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

    new cdk.CfnOutput(this, "NotificationSenderLambdaName", {
      value: this.notificationSenderLambda.functionName,
    });

    new cdk.CfnOutput(this, "NotificationScheduleRuleName", {
      value: notificationRule.ruleName,
    });
  }
}