import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  try {
    const { userId, email } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing userId" }),
      };
    }

    const PK = `USER#${userId.trim()}`;
    const SK = "PROFILE";

    // Try to get user from DynamoDB
    const getUserResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
      })
    );

    // If user not found, create it
    if (!getUserResult.Item) {
      let user = {
        PK,
        SK,
        email,
        createdAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: user,
        })
      );
    }

    // Try and get job applications for the user
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :PK",
        ExpressionAttributeValues: { ":PK": PK },
      })
    );

    const jobApps =
      result.Items?.filter((i) => i.SK.startsWith("JOB#")) || [];

    // TODO: Map the user data to frontend User type
    const frontendUser = {
      id: userId,
      email: email,
      jobApps: jobApps,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(frontendUser),
    };
  } catch (error) {
    console.error("Error fetching user data:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
