process.env.TABLE_NAME = "TestTable";

import { getUserBySub } from "./userRepository";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

// Mock the dynamo db client
jest.mock("../db", () => ({
  getDocClient: jest.fn(),
}));

// Import mocked function second! Important so it doesn't creat a real client
import { getDocClient } from "../db";

describe("getUserBySub", () => {
  it("sends a GetCommand with the correct PK and SK", async () => {
    // Mocked DynamoDB response
    const sendMock = jest.fn().mockResolvedValue({
      Item: {
        PK: "USER#123",
        SK: "PROFILE",
        email: "test@example.com",
        sendNotifications: false,
      },
    });

    // Make getDocClient return mocked client
    (getDocClient as jest.Mock).mockReturnValue({
      send: sendMock,
    });

    // Call function under test
    const actual = await getUserBySub("123");

    // Assert DynamoDB was called correctly
    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetCommand);

    expect(command.input).toEqual({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: "USER#123",
        SK: "PROFILE",
      },
    });

    // Assert
    expect(actual?.email).toBe("test@example.com");
  });
});
