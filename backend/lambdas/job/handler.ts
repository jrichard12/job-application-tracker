import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

const addJob = async (userId: string, event: any) => {
  console.log("=== AddJob START ===");
  const { job } = event.body ? JSON.parse(event.body) : {};
  if (!job) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Missing job data" }),
    };
  }

  const PK = `USER#${userId}`;
  const SK = `JOB#${job.id}`;
  const dbJob = { PK, SK, ...job, createdAt: new Date().toISOString() };
  console.log("Creating job with PK:", PK, "SK:", SK);

  try {
    console.log("Attempting to save job to DynamoDB...");
    const params = {
      TableName: TABLE_NAME,
      Item: dbJob,
    };
    await docClient.send(new PutCommand(params));
    console.log("Job saved successfully to DynamoDB");

    console.log("=== AddJob END (SUCCESS) ===");
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbJob),
    };
  } catch (error) {
    console.error("=== AddJob END (FAILED) ===");
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error adding job" }),
    };
  }
};

const updateJob = async (event: any) => {
  const job = event.body ? JSON.parse(event.body).job : null;
  if (!job) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Missing job data" }),
    };
  }
  const { PK, SK } = job;

  if (!PK || !SK) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Missing PK or SK in job object." }),
    };
  }

  // Auto update lastUpdated
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
    return {  
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "No valid fields to update" }),
    };
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
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.Attributes),
    };
  } catch (error: any) {
    console.error("Error updating job:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error updating job", error }),
    };
  }
};

const deleteJob = async (
  userId: string,
  event: any
) => {
  const { SK } = event.queryStringParameters || {};
  const PK = `USER#${userId}`;

  const params = {
    TableName: TABLE_NAME,
    Key: { PK, SK },
    ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
  };
  try {
    await docClient.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Job deleted successfully" }),
    }
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error deleting job", error }),
    };
  }
};

const getJobs = async (userId: string) => {
  console.log("=== GetJobs START ===");
  const PK = `USER#${userId}`;

  try {
    console.log("Querying DynamoDB for PK:", PK);
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": PK,
        ":skPrefix": "JOB#",
      },
    };

    const result = await docClient.send(new QueryCommand(params));
    console.log("Query successful, found", result.Items?.length || 0, "jobs");

    const jobs = result.Items || [];

    console.log("=== GetJobs END (SUCCESS) ===");
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobs),
    };
  } catch (error) {
    console.error("=== GetJobs END (FAILED) ===");
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error fetching jobs" }),
    };
  }
};

export const handler = async (event: any) => {
  console.log("=== JobHandler START ===");

  try {
    console.log("Processing main request...");
    const claims = event.requestContext?.authorizer?.jwt?.claims;

    if (!claims) {
      throw new Error("No JWT claims found");
    }

    const sub = claims.sub; // the unique Cognito user ID
    const method = event.requestContext.http.method;

    switch (method) {
      case "GET":
        return await getJobs(sub);
      case "POST":
        return await addJob(sub, event);
      case "PUT":
        return await updateJob(event);
      case "DELETE": {
        return await deleteJob(sub, event);
      }
      default:
        console.error("Unsupported method:", method);
        return {
          statusCode: 405,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("=== ERROR in JobHandler ===");
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    console.log("=== JobHandler END ===");
  }
};
