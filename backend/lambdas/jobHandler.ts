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

const addJob = async (body: any) => {
  const { userId, job } = body;
  if (!userId || !job) {
    return { statusCode: 400, body: "Missing userId or job data" };
  }

  const PK = `USER#${userId}`;
  const SK = `JOB#${job.id}`;
  const dbJob = { PK, SK, ...job, createdAt: new Date().toISOString() };

  try {
    const params = {
      TableName: TABLE_NAME,
      Item: dbJob,
    };
    await docClient.send(new PutCommand(params));

    return { statusCode: 200, body: JSON.stringify(dbJob) };
  } catch (error) {
    console.error("Error adding job:", error);
    return { statusCode: 500, body: "Error adding job" };
  }
};

// const updateJob = async (job: any) => {
//   const params = {
//     TableName: TABLE_NAME,
//     Key: { id: job.id },
//     UpdateExpression: "set #status = :status, #isArchived = :isArchived",
//     ExpressionAttributeNames: {
//       "#status": "status",
//       "#isArchived": "isArchived",
//     },
//     ExpressionAttributeValues: {
//       ":status": job.status,
//       ":isArchived": job.isArchived,
//     },
//   };
//   await docClient.send(new PutCommand(params));
//   return { statusCode: 200, body: JSON.stringify(job) };
// };

// const deleteJob = async (jobId: string) => {
//   const params = {
//     TableName: TABLE_NAME,
//     Key: { id: jobId },
//   };
//   await docClient.send(new GetCommand(params));
//   return { statusCode: 200, body: JSON.stringify({ message: "Job deleted" }) };
// };

export const handler = async (event: any) => {
  const method = event.requestContext.http.method;
  const body = event.body ? JSON.parse(event.body) : {};

  switch (method) {
    case "POST":
      return await addJob(body);
    // case "PUT":
    //   return await updateJob(body);
    // case "DELETE":
    //   return await deleteJob(body);
    default:
      return { statusCode: 405, body: "Method Not Allowed" };
  }
};
