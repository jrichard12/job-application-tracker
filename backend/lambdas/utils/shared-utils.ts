import { CognitoJwtVerifier } from "aws-jwt-verify";

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.CLIENT_ID!;

// Create JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

/**
 * Get CORS headers based on the request origin
 */
export const getCorsHeaders = (event: any) => {
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

/**
 * Verify JWT token locally (no Lambda invocation)
 */
export const verifyTokenLocally = async (authorizationHeader: string) => {
  console.log('=== Local Token Verification START ===');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header format');
    throw new Error('Missing or invalid authorization header');
  }

  const token = authorizationHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    console.log('Calling verifier.verify()...');
    const payload = await verifier.verify(token);
    console.log('=== Local Token Verification END (SUCCESS) ===');
    return payload;
  } catch (error) {
    console.error('=== Local Token Verification END (FAILED) ===');
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Invalid token');
  }
};

/**
 * Create a standardized response object
 */
export const createResponse = (statusCode: number, body: any, event?: any, corsHeaders?: any) => {
  const headers = corsHeaders || (event ? getCorsHeaders(event) : {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
  });

  return {
    statusCode,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
};
