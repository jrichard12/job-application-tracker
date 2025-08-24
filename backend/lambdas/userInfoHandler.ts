import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.CLIENT_ID!;

// Create JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

const verifyToken = async (authorizationHeader: string) => {
  console.log('=== Token Verification START ===');
  
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header format');
    throw new Error('Missing or invalid authorization header');
  }

  const token = authorizationHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    console.log('Calling verifier.verify()...');
    const payload = await verifier.verify(token);
    console.log('=== Token Verification END (SUCCESS) ===');
    return payload;
  } catch (error) {
    console.error('=== Token Verification END (FAILED) ===');
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Invalid token');
  }
};

const getCorsHeaders = (event: any) => {
  const origin = event.headers?.origin;
  
  // Only allow specific localhost ports
  let allowOrigin = null;
  if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
    allowOrigin = origin;
  }
  
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin || 'http://localhost:5173', // fallback to 5173
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };
  
  return headers;
};

export const handler = async (event: any) => {
  console.log('=== UserInfoHandler START ===');
  
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
      tokenPayload = await verifyToken(authHeader);
      console.log('Token verification successful.');
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    console.log('Parsing request body...');
    const { userId, email } = JSON.parse(event.body);
    
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
    console.log('DynamoDB keys - PK:', PK, 'SK:', SK);

    // Try to get user from DynamoDB
    console.log('Attempting to get user from DynamoDB...');
    const getUserResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
      })
    );

    // If user not found, create it
    if (!getUserResult.Item) {
      console.log('Creating new user in DynamoDB...');
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
      console.log('New user created successfully');
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

    // TODO: Map the user data to frontend User type
    const frontendUser = {
      id: userId,
      email: email,
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
    return successResponse;
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
