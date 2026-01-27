import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient } from "../db";

const TABLE_NAME = process.env.TABLE_NAME!;

export async function getUserBySub(sub: string) {
  const docClient = getDocClient();

  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    }),
  );

  return result.Item ?? null;
}

export async function createUserItem(sub: string, email: string) {
  const docClient = getDocClient();

  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

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
    }),
  );

  return user;
}

export async function updateUserItem(
  sub: string,
  updateData: Record<string, any>,
) {
  const docClient = getDocClient();

  const PK = `USER#${sub.trim()}`;
  const SK = "PROFILE";

  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.keys(updateData).forEach((key, index) => {
    const attributeName = `#attr${index}`;
    const attributeValue = `:val${index}`;

    updateExpressions.push(`${attributeName} = ${attributeValue}`);
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = updateData[key];
  });

  const updateExpression = "SET " + updateExpressions.join(", ");

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }),
  );
}
