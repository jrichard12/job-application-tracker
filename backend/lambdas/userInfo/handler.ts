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

const getUser = async (tokenPayload: any, corsHeaders: any, event: any) => {
  console.log('=== GetUserInfo START ===');
  const userId = event.queryStringParameters?.userId;
  
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
    console.error('Missing userId in query parameters');
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Missing userId query parameter" }),
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
  
  // Return user profile if found, otherwise return null
  if (!getUserResult.Item) {
    console.log('User not found in DynamoDB');
    const response = {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(null),
    };
    console.log('=== GetUserInfo END ===');
    return response;
  }

  const frontendUser = {
    id: userId,
    email: getUserResult.Item.email,
    sendNotifications: getUserResult.Item.sendNotifications || false,
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

const createUser = async (body: any, tokenPayload: any, corsHeaders: any, event: any) => {
  console.log('=== CreateUser START ===');
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
  
  if (!userId || !email) {
    console.error('Missing userId or email in request');
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Missing userId or email" }),
    };
  }
  
  const PK = `USER#${userId.trim()}`;
  const SK = "PROFILE";

  // Check if user already exists
  console.log('Checking if user already exists...');
  const getUserResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );
  
  if (getUserResult.Item) {
    console.log('User already exists');
    const frontendUser = {
      id: userId,
      email: getUserResult.Item.email,
      sendNotifications: getUserResult.Item.sendNotifications || false,
    };
    
    const response = {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frontendUser),
    };
    console.log('=== CreateUser END ===');
    return response;
  }

  // Create new user
  console.log('Creating new user in DynamoDB...');
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
  console.log('New user created successfully');

  const frontendUser = {
    id: userId,
    email: email,
    sendNotifications: false,
  };

  const successResponse = {
    statusCode: 201,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(frontendUser),
  };
  console.log('=== CreateUser END ===');
  return successResponse;
};

const updateUser = async (body: any, tokenPayload: any, corsHeaders: any, event: any) => {
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
        return await getUser(tokenPayload, corsHeaders, event);
      case 'POST':
        return await createUser(body, tokenPayload, corsHeaders, event);
      case 'PUT':
        return await updateUser(body, tokenPayload, corsHeaders, event);
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
