import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommand,
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
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
  
  return headers;
};

const createResponse = (statusCode: number, body: any, event?: any) => {
  return {
    statusCode,
    headers: event ? getCorsHeaders(event) : {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
    },
    body: JSON.stringify(body),
  };
};

const addJob = async (body: any, tokenPayload: any, event: any) => {
  console.log('=== AddJob START ===');
  
  const { userId, job } = body;
  if (!userId || !job) {
    console.error('Missing userId or job data. userId:', userId, 'job:', !!job);
    return createResponse(400, { message: "Missing userId or job data" }, event);
  }

  // Verify that the token's sub matches the requested userId
  if (tokenPayload.sub !== userId) {
    console.error('User ID mismatch. Token sub:', tokenPayload.sub, 'Requested userId:', userId);
    return createResponse(403, { message: 'Forbidden: User ID mismatch' }, event);
  }

  const PK = `USER#${userId}`;
  const SK = `JOB#${job.id}`;
  const dbJob = { PK, SK, ...job, createdAt: new Date().toISOString() };
  console.log('Creating job with PK:', PK, 'SK:', SK);

  try {
    console.log('Attempting to save job to DynamoDB...');
    const params = {
      TableName: TABLE_NAME,
      Item: dbJob,
    };
    await docClient.send(new PutCommand(params));
    console.log('Job saved successfully to DynamoDB');

    console.log('=== AddJob END (SUCCESS) ===');
    return createResponse(200, dbJob, event);
  } catch (error) {
    console.error('=== AddJob END (FAILED) ===');
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return createResponse(500, { message: "Error adding job" }, event);
  }
};

const updateJob = async (body: any, tokenPayload: any, event: any) => {
  const job = body;
  const { PK, SK } = job;

  if (!PK || !SK) {
    return createResponse(400, { message: "Missing PK or SK in job object." }, event);
  }

  // Extract userId from PK to verify ownership
  const userId = PK.replace('USER#', '');
  if (tokenPayload.sub !== userId) {
    return createResponse(403, { message: 'Forbidden: User ID mismatch' }, event);
  }

  // Always update lastUpdated
  job.lastUpdated = new Date().toISOString();

  // Build the UpdateExpression dynamically from job object, excluding PK, SK, userId, id
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  let attrIndex = 0;
  Object.entries(job).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      key !== "PK" &&
      key !== "SK" &&
      key !== "id" &&
      key !== "createdAt"
    ) {
      const attrName = `#attr${attrIndex}`;
      const attrValue = `:val${attrIndex}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;
      attrIndex++;
    }
  });

  if (updateExpressions.length === 0) {
    return createResponse(400, { message: "No valid fields to update" }, event);
  }

  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)", // Ensure job exists
    ReturnValues: "ALL_NEW", // Return updated item
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return createResponse(200, result.Attributes, event);
  } catch (error: any) {
    console.error("Error updating job:", error);
    return createResponse(500, { message: "Error updating job", error }, event);
  }
};

const deleteJob = async (PK: string, SK: string, tokenPayload: any, event: any) => {
  console.log("DeleteJob recieved PK:", PK, "SK:", SK);
  
  if (!PK || !SK) {
    console.log("Missing PK or SK for delete");
    return createResponse(400, { message: "Missing PK or SK for delete" }, event);
  }

  // Extract userId from PK to verify ownership
  const userId = PK.replace('USER#', '');
  if (tokenPayload.sub !== userId) {
    return createResponse(403, { message: 'Forbidden: User ID mismatch' }, event);
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
  };
  try {
    await docClient.send(new DeleteCommand(params));
    return createResponse(200, { message: "Job deleted" }, event);
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return createResponse(500, { message: "Error deleting job", error }, event);
  }
};

export const handler = async (event: any) => {
  console.log('=== JobHandler START ===');
  console.log("JobHandler event:", typeof event === 'string' ? event : JSON.stringify(event, null, 2));
  
  // Handle OPTIONS requests for CORS
  if (event.requestContext.http.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return createResponse(200, {}, event);
  }

  try {
    console.log('Processing main request...');
    
    // Verify authentication token
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    
    let tokenPayload;
    try {
      console.log('Attempting token verification...');
      tokenPayload = await verifyToken(authHeader);
    } catch (error) {
      console.error('Token verification failed:', error);
      return createResponse(401, { message: 'Unauthorized' }, event);
    }

    const method = event.requestContext.http.method;
    const body = event.body ? JSON.parse(event.body) : {};

    switch (method) {
      case "POST":
        console.log('Processing POST request (create job)');
        return await addJob(body, tokenPayload, event);
      case "PUT":
        console.log('Processing PUT request (update job)');
        return await updateJob(body, tokenPayload, event);
      case "DELETE": {
        console.log('Processing DELETE request (delete job)');
        // Get PK and SK from queryStringParameters
        const params = event.queryStringParameters || {};
        const { PK, SK } = params;
        console.log('Delete params - PK:', PK, 'SK:', SK);
        return await deleteJob(PK, SK, tokenPayload, event);
      }
      default:
        console.error('Unsupported method:', method);
        return createResponse(405, { message: "Method Not Allowed" }, event);
    }
  } catch (error) {
    console.error('=== ERROR in JobHandler ===');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return createResponse(500, { message: 'Internal Server Error' }, event);
  } finally {
    console.log('=== JobHandler END ===');
  }
};
