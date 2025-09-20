import * as cdk from "aws-cdk-lib";
//import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";

export class HostingStack extends cdk.Stack {
  public readonly hostingBucket: s3.Bucket;
  //public readonly cfDistribution: cloudfront.Distribution;
  public readonly hostingBucketDeployment: s3deploy.BucketDeployment;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // HOSTING BUCKET
    this.hostingBucket = new s3.Bucket(this, "HostingBucket", {
      bucketName: "my-app-tracker",
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html", // helpful for SPAs
      removalPolicy: cdk.RemovalPolicy.DESTROY, // only for dev/demo!
      autoDeleteObjects: true, // only for dev/demo!
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
      publicReadAccess: true, // allow public bucket policy
    });

    this.hostingBucketDeployment = new s3deploy.BucketDeployment(
      this,
      "DeployHostingBucket",
      {
        sources: [
          s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist")),
        ],
        destinationBucket: this.hostingBucket,
      }
    );

    // TODO: Option to add CloudFront later

    new cdk.CfnOutput(this, "AppURL", {
      value: this.hostingBucket.bucketWebsiteUrl,
    });
  }
}
