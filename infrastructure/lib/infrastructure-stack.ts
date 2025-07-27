import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class InfrastructureStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    this.userPoolClient = new cognito.UserPoolClient(this, "AppTrackerUserPoolClient", {
      userPoolClientName: "AppTrackerUserPoolClient",
      userPool: this.userPool,
      generateSecret: false, // must be false for frontend apps
    });

    // Output values for use in frontend .env
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "ClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}

export class InfraStack extends cdk.Stack {}
