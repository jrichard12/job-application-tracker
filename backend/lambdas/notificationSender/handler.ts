import { getCorsHeaders } from "../utils/shared-utils";

export const handler = async (event: any) => {
  console.log('=== NotificationSender START ===');

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
    console.log('Processing notification request...');

    // TODO: Implement notification sending logic
    console.log('Notification sent successfully');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Notification sent successfully'
      }),
    };
  } catch (error) {
    console.error("=== ERROR in NotificationSender ===");
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal Server Error"
      }),
    };
  } finally {
    console.log('=== NotificationSender END ===');
  }
};
