import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

const TABLE_NAME = process.env.TABLE_NAME!;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL!;
const SES_FROM_NAME = 'App Tracker';

interface User {
  PK: string;
  SK: string;
  email: string;
  sendNotifications: boolean;
}

interface Job {
  PK: string;
  SK: string;
  id: string;
  company: string;
  jobTitle: string;
  jobStatus: string;
  deadline?: string;
  location?: string;
  salary?: string;
}

/**
 * EventBridge-triggered Lambda handler for sending deadline notifications
 * This function is called daily by CloudWatch Events/EventBridge (no HTTP interface)
 */
export const handler = async (event: any) => {
  console.log('=== NotificationSender START ===');
  console.log('Event received:', JSON.stringify(event, null, 2));

  try {
    console.log('Processing scheduled notification job...');

    // Step 1: Scan the DynamoDB table for all users with sendNotifications = true
    console.log('Scanning for users with notifications enabled...');
    const usersWithNotifications = await getAllUsersWithNotifications();
    console.log(`Found ${usersWithNotifications.length} users with notifications enabled`);

    if (usersWithNotifications.length === 0) {
      console.log('No users with notifications enabled, exiting');
      return {
        statusCode: 200,
        message: 'No users with notifications enabled'
      };
    }

    // Step 2: Process each user
    const processedUsers = [];
    for (const user of usersWithNotifications) {
      console.log(`Processing user: ${user.email}`);
      
      // Step 3: Get all jobs with status "Interested" for this user
      const interestedJobs = await getInterestedJobsForUser(user.PK);
      console.log(`Found ${interestedJobs.length} interested jobs for user ${user.email}`);

      if (interestedJobs.length === 0) {
        console.log(`No interested jobs for user ${user.email}, skipping`);
        continue;
      }

      // Step 4: Filter jobs with deadlines within 2 days
      const urgentJobs = filterJobsWithUpcomingDeadlines(interestedJobs);
      console.log(`Found ${urgentJobs.length} jobs with deadlines within 2 days for user ${user.email}`);

      if (urgentJobs.length === 0) {
        console.log(`No urgent jobs for user ${user.email}, skipping`);
        continue;
      }

      // Step 5: Send email notification
      try {
        await sendDeadlineNotification(user.email, urgentJobs);
        console.log(`Successfully sent notification to ${user.email}`);
        processedUsers.push(user.email);
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    console.log(`Notification processing complete. Sent notifications to ${processedUsers.length} users.`);

    return {
      statusCode: 200,
      message: `Notifications sent successfully to ${processedUsers.length} users`,
      processedUsers
    };
  } catch (error) {
    console.error("=== ERROR in NotificationSender ===");
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');

    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    console.log('=== NotificationSender END ===');
  }
};

/**
 * Scan DynamoDB table for all users with sendNotifications = true
 */
async function getAllUsersWithNotifications(): Promise<User[]> {
  const users: User[] = [];
  let lastEvaluatedKey: any = undefined;

  do {
    const params: ScanCommandInput = {
      TableName: TABLE_NAME,
      FilterExpression: 'SK = :sk AND sendNotifications = :notifications',
      ExpressionAttributeValues: {
        ':sk': 'PROFILE',
        ':notifications': true
      },
      ExclusiveStartKey: lastEvaluatedKey
    };

    const result = await docClient.send(new ScanCommand(params));
    
    if (result.Items) {
      users.push(...result.Items as User[]);
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return users;
}

/**
 * Get all jobs with status "Interested" for a specific user
 */
async function getInterestedJobsForUser(userPK: string): Promise<Job[]> {
  // Use Query instead of Scan for better performance
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'jobStatus = :status',
    ExpressionAttributeValues: {
      ':pk': userPK,
      ':skPrefix': 'JOB#',
      ':status': 'Interested'
    }
  };

  const result = await docClient.send(new QueryCommand(params));
  return (result.Items as Job[]) || [];
}

/**
 * Filter jobs that have deadlines within 2 days
 */
function filterJobsWithUpcomingDeadlines(jobs: Job[]): Job[] {
  const now = new Date();
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(now.getDate() + 2);

  return jobs.filter(job => {
    if (!job.deadline) {
      return false; // Skip jobs without deadlines
    }

    const deadline = new Date(job.deadline);
    return deadline >= now && deadline <= twoDaysFromNow;
  });
}

/**
 * Send email notification about upcoming deadlines
 */
async function sendDeadlineNotification(userEmail: string, urgentJobs: Job[]): Promise<void> {
  const subject = `Job Application Deadlines Approaching`;

  const htmlBody = generateEmailHTML(urgentJobs);
  const textBody = generateEmailText(urgentJobs);

  const params: SendEmailCommandInput = {
    Source: `"${SES_FROM_NAME}" <${SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [userEmail]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8'
        }
      }
    }
  };

  await sesClient.send(new SendEmailCommand(params));
}

/**
 * Generate HTML email body
 */
function generateEmailHTML(jobs: Job[]): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const jobRows = jobs.map(job => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; font-weight: bold;">${job.company}</td>
      <td style="padding: 12px;">${job.jobTitle}</td>
      <td style="padding: 12px;">${job.location || 'N/A'}</td>
      <td style="padding: 12px;">${job.salary || 'N/A'}</td>
      <td style="padding: 12px; color: #e74c3c; font-weight: bold;">${formatDate(job.deadline!)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Job Application Deadlines</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
        <h1 style="color: #3498db; margin-top: 0;">Job Application Deadlines Approaching</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">
          You have <strong>${jobs.length} job application${jobs.length > 1 ? 's' : ''}</strong> with deadlines coming up within the next 2 days. 
          Take a moment to review the details below.
        </p>
      </div>

      <div style="margin: 20px 0;">
        <h2 style="color: #333; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Upcoming Deadlines</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="padding: 12px; text-align: left;">Company</th>
              <th style="padding: 12px; text-align: left;">Position</th>
              <th style="padding: 12px; text-align: left;">Location</th>
              <th style="padding: 12px; text-align: left;">Salary</th>
              <th style="padding: 12px; text-align: left;">Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${jobRows}
          </tbody>
        </table>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">💡 Quick Tips:</h3>
        <ul style="color: #856404; margin: 10px 0;">
          <li>Review your application materials before submitting</li>
          <li>Double-check all requirements and documents</li>
          <li>Submit early to avoid last-minute technical issues</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          This is an automated notification from App Tracker.<br>
          To manage your notification preferences, please log in to your account.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email body
 */
function generateEmailText(jobs: Job[]): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const jobList = jobs.map(job => 
    `• ${job.company} - ${job.jobTitle}\n  Location: ${job.location || 'N/A'}\n  Salary: ${job.salary || 'N/A'}\n  Deadline: ${formatDate(job.deadline!)}\n`
  ).join('\n');

  return `
JOB APPLICATION DEADLINES APPROACHING

You have ${jobs.length} job application${jobs.length > 1 ? 's' : ''} with deadlines coming up within the next 2 days. Take a moment to review the details below.

UPCOMING DEADLINES:
${jobList}

QUICK TIPS:
• Review your application materials before submitting
• Double-check all requirements and documents  
• Submit early to avoid last-minute technical issues

---
This is an automated notification from App Tracker.
To manage your notification preferences, please log in to your account.
  `.trim();
}
