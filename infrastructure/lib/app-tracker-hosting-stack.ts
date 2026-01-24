import * as cdk from "aws-cdk-lib";
//import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";

export class AppTrackerHostingStack extends cdk.Stack {
  public readonly appTrackerHostingBucket: s3.Bucket;
  //public readonly cfDistribution: cloudfront.Distribution;
  public readonly appTrackerHostingBucketDeployment : s3deploy.BucketDeployment;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // HOSTING BUCKET
    this.appTrackerHostingBucket = new s3.Bucket(this, "AppTrackerHostingBucket", {
      bucketName: "my-app-tracker",
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html", 
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
      publicReadAccess: true,
    });

    this.appTrackerHostingBucketDeployment = new s3deploy.BucketDeployment(
      this,
      "DeployAppTrackerHostingBucket",
      {
        sources: [
          s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist")),
        ],
        destinationBucket: this.appTrackerHostingBucket,
      }
    );

    // TODO: Option to add CloudFront later

    new cdk.CfnOutput(this, "AppURL", {
      value: this.appTrackerHostingBucket.bucketWebsiteUrl,
    });
  }
}
