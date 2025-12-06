import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

const getUser = async (sub: any) => {
  console.log("=== GetUser START ===");
  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

  // Try to get user from DynamoDB
  console.log("Attempting to get user from DynamoDB...");
  const getUserResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );

  // Return user profile if found, otherwise return null
  if (!getUserResult.Item) {
    console.log("User not found in DynamoDB");
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(null),
    };
    console.log("=== GetUser END ===");
    return response;
  }

  const frontendUser = {
    id: sub,
    email: getUserResult.Item.email,
    sendNotifications: getUserResult.Item.sendNotifications || false,
  };

  const successResponse = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(frontendUser),
  };
  console.log("=== GetUser END ===");
  return successResponse;
};

const createUser = async (
  sub: any,
  email: any,
  event: any
) => {
  console.log("=== CreateUser START ===");

  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

  // Check if user already exists
  console.log("Checking if user already exists...");
  const getUserResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );

  if (getUserResult.Item) {
    console.log("User already exists");
    const frontendUser = {
      id: sub,
      email: getUserResult.Item.email,
      sendNotifications: getUserResult.Item.sendNotifications || false,
    };

    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(frontendUser),
    };
    console.log("=== CreateUser END ===");
    return response;
  }

  // Create new user
  console.log("Creating new user in DynamoDB...");
  const user = {
    PK,
    SK,
    email,
    sendNotifications: false,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
    })
  );
  console.log("New user created successfully");

  const frontendUser = {
    id: sub,
    email: email,
    sendNotifications: false,
  };

  const successResponse = {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(frontendUser),
  };
  console.log("=== CreateUser END ===");
  return successResponse;
};

const updateUser = async (
  body: any,
  sub: any,
  event: any
) => {
  console.log("=== UpdateUser START ===");
  const {...updateData } = body;

  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

  // Update user profile
  console.log("Updating user profile in DynamoDB...");
  console.log("Update data received:", updateData);

  // Build the UpdateExpression dynamically based on the fields to update
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  // Add other fields to update
  Object.keys(updateData).forEach((key, index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;

    updateExpressions.push(`${attributeName} = ${attributeValue}`);
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = updateData[key];
  });

  const updateExpression = "SET " + updateExpressions.join(", ");

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    })
  );
  console.log("User profile updated successfully");

  const successResponse = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "User profile updated successfully" }),
  };
  console.log("=== UpdateUser END ===");
  return successResponse;
};

export const handler = async (event: any) => {
  console.log("=== UserHandler START ===");
  console.log("Raw event:", JSON.stringify(event, null, 2));

  try {
    const claims = event.requestContext?.authorizer?.jwt?.claims;

    if (!claims) {
      throw new Error("No JWT claims found");
    }

    const sub = claims.sub; // the unique Cognito user ID
    const email = claims.email;
    const method = event.requestContext?.http?.method || "GET";

    switch (method) {
      case "GET":
        return await getUser(sub);
      case "POST":
        return await createUser(sub, email, event);
      case "PUT":
        return await updateUser(sub, email, event);
      default:
        console.error("Unsupported method:", method);
        return {
          statusCode: 405,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("=== ERROR in UserHandler ===");
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    console.log("=== UserHandler END ===");
  }
};
