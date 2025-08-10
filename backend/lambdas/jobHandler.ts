import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

const addJob = async (body: any) => {
  const { userId, job } = body;
  if (!userId || !job) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing userId or job data" }) };
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
    return { statusCode: 500, body: JSON.stringify({ message: "Error adding job" }) };
  }
};

const updateJob = async (body: any) => {
  const job = body;
  const { PK, SK } = job;

  if (!PK || !SK) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing PK or SK in job object." }) };
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
    return { statusCode: 400, body: JSON.stringify({ message: "No valid fields to update" }) };
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
  console.log("Update params:", JSON.stringify(params, null, 2));

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error: any) {
    console.error("Error updating job:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating job", error }),
    };
  }
};

const deleteJob = async (body: any) => {
  console.log("DeleteJob recieved body:", body);
  const { PK, SK } = body;
  if (!PK || !SK) {
    console.log("Missing PK or SK for delete");
    return { statusCode: 400, body: JSON.stringify({ message: "Missing PK or SK for delete" }) };
  }
  const params = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
  };
  try {
    await docClient.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Job deleted" }),
    };
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting job", error }),
    };
  }
};

export const handler = async (event: any) => {
  console.log("JobHandler event:", typeof event === 'string' ? event : JSON.stringify(event));
  const method = event.requestContext.http.method;
  const body = event.body ? JSON.parse(event.body) : {};

  switch (method) {
    case "POST":
      return await addJob(body);
    case "PUT":
      return await updateJob(body);
    case "DELETE": {
      // Get PK and SK from queryStringParameters
      const params = event.queryStringParameters || {};
      const { PK, SK } = params;
      return await deleteJob({ PK, SK });
    }
    default:
      return { statusCode: 405, body: "Method Not Allowed" };
  }
};
