import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getCorsHeaders, verifyTokenLocally } from "../utils/shared-utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

const getUserInfo = async (body: any, tokenPayload: any, corsHeaders: any, event: any) => {
  console.log('=== GetUserInfo START ===');
  const { userId, email } = body;
  // Verify that the token's sub matches the requested userId
  if (tokenPayload.sub !== userId) {
    console.error('User ID mismatch.');
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Forbidden: User ID mismatch' }),
    };
  }
  if (!userId) {
    console.error('Missing userId in request');
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Missing userId" }),
    };
  }
  const PK = `USER#${userId.trim()}`;
  const SK = "PROFILE";

  // Try to get user from DynamoDB
  console.log('Attempting to get user from DynamoDB...');
  const getUserResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );
  
  let sendNotifications = false;
  
  // If user not found, create it
  if (!getUserResult.Item) {
    console.log('Creating new user in DynamoDB...');
    let user = {
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
    console.log('New user created successfully');
    sendNotifications = false;
  } else {
    // User exists, get their current sendNotifications preference
    sendNotifications = getUserResult.Item.sendNotifications || false;
  }
  // Try and get job applications for the user
  console.log('Querying for user job applications...');
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": PK },
    })
  );
  const jobApps =
    result.Items?.filter((i) => i.SK.startsWith("JOB#")) || [];
  console.log('Found', jobApps.length, 'job applications for user');

  const frontendUser = {
    id: userId,
    email: email,
    sendNotifications: sendNotifications,
    jobApps: jobApps,
  };

  const successResponse = {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(frontendUser),
  };
  console.log('=== GetUserInfo END ===');
  return successResponse;
};

const updateUserInfo = async (body: any, tokenPayload: any, corsHeaders: any, event: any) => {
  console.log('=== UpdateUserInfo START ===');
  const { userId, ...updateData } = body;

  // Verify that the token's sub matches the requested userId
  if (tokenPayload.sub !== userId) {
    console.error('User ID mismatch.');
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Forbidden: User ID mismatch' }),
    };
  }

  if (!userId) {
    console.error('Missing userId in request');
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Missing userId" }),
    };
  }

  const PK = `USER#${userId.trim()}`;
  const SK = "PROFILE";

  // Update user profile
  console.log('Updating user profile in DynamoDB...');
  console.log('Update data received:', updateData);
  
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
  
  const updateExpression = 'SET ' + updateExpressions.join(', ');
  
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'UPDATED_NEW'
    })
  );
  console.log('User profile updated successfully');

  const successResponse = {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'User profile updated successfully' }),
  };
  console.log('=== UpdateUserInfo END ===');
  return successResponse;
};

export const handler = async (event: any) => {
  console.log('=== UserInfoHandler START ===');
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  const corsHeaders = getCorsHeaders(event);
  
  // Handle OPTIONS requests for CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    console.log('Processing main request...');
    
    // Verify authentication token
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    
    let tokenPayload;
    try {
      console.log('Attempting token verification...');
      tokenPayload = await verifyTokenLocally(authHeader);
      console.log('Token verification successful.');
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    const method = event.requestContext?.http?.method || 'GET';
    const body = event.body ? JSON.parse(event.body) : {};
    
    switch (method) {
      case 'GET':
      case 'POST':
        return await getUserInfo(body, tokenPayload, corsHeaders, event);
      case 'PUT':
        return await updateUserInfo(body, tokenPayload, corsHeaders, event);
      default:
        console.error('Unsupported method:', method);
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error("=== ERROR in UserInfoHandler ===");
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');

    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    console.log('=== UserInfoHandler END ===');
  }
};
