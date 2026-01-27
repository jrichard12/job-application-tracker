import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let cachedDocClient: DynamoDBDocumentClient | null = null;

export function getDocClient() {
  console.log("=== getDocClient ===");
  if (!cachedDocClient) {
    const client = new DynamoDBClient({});
    cachedDocClient = DynamoDBDocumentClient.from(client);
  }
  return cachedDocClient;
}