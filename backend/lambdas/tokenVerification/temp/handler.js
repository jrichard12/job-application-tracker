"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_jwt_verify_1 = require("aws-jwt-verify");
// import { getCorsHeaders } from "../../utils/shared-utils";
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
// Create JWT verifier
const verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: USER_POOL_ID,
    tokenUse: "id",
    clientId: CLIENT_ID,
});
const handler = async (event) => {
    console.log('=== TokenVerificationHandler START ===');
    const corsHeaders = { 'Content-Type': 'application/json' };
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
        console.log('Processing token verification request...');
        // Handle both Lambda invocation (direct payload) and HTTP requests (via event.body)
        let authorizationHeader;
        if (event.authorizationHeader) {
            // Direct Lambda invocation
            authorizationHeader = event.authorizationHeader;
        }
        else if (event.body) {
            // HTTP request
            const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            authorizationHeader = body.authorizationHeader;
        }
        else {
            throw new Error('Missing authorization header in request');
        }
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            console.error('Missing or invalid authorization header format');
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    verified: false,
                    error: 'Missing or invalid authorization header'
                }),
            };
        }
        const token = authorizationHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            console.log('Calling verifier.verify()...');
            const payload = await verifier.verify(token);
            console.log('=== Token Verification END (SUCCESS) ===');
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verified: true,
                    payload
                }),
            };
        }
        catch (error) {
            console.error('=== Token Verification END (FAILED) ===');
            console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
            return {
                statusCode: 200, // Return 200 with verified: false
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    verified: false,
                    error: 'Invalid token'
                }),
            };
        }
    }
    catch (error) {
        console.error("=== ERROR in TokenVerificationHandler ===");
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                verified: false,
                error: "Internal Server Error"
            }),
        };
    }
    finally {
        console.log('=== TokenVerificationHandler END ===');
    }
};
exports.handler = handler;
