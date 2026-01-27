import {
  getUserBySub,
  createUserItem,
  updateUserItem,
} from "./userRepository/userRepository";

const getUser = async (sub: any) => {
  console.log("=== GetUser START ===");

  const user = await getUserBySub(sub);

  if (!user) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    };
  }

  const frontendUser = {
    id: sub,
    email: user.email,
    sendNotifications: user.sendNotifications || false,
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(frontendUser),
  };
};

const createUser = async (sub: any, email: any) => {
  console.log("=== CreateUser START ===");

  const existingUser = await getUserBySub(sub);

  if (existingUser) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sub,
        email: existingUser.email,
        sendNotifications: existingUser.sendNotifications || false,
      }),
    };
  }

  const newUser = await createUserItem(sub, email);

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: sub,
      email: newUser.email,
      sendNotifications: false,
    }),
  };
};


const updateUser = async (body: any, sub: any) => {
  console.log("=== UpdateUser START ===");

  await updateUserItem(sub, body);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "User profile updated successfully" }),
  };
};


export const handler = async (event: any) => {
  console.log("=== UserHandler START ===");
  console.log("Raw event:", JSON.stringify(event, null, 2));

  try {
    const claims = event.requestContext?.authorizer?.jwt?.claims;

    if (!claims) {
      throw new Error("No JWT claims found");
    }

    const sub = claims.sub; // the unique Cognito user ID
    const email = claims.email;
    const method = event.requestContext?.http?.method || "GET";

    switch (method) {
      case "GET":
        return await getUser(sub);
      case "POST":
        return await createUser(sub, email);
      case "PUT":
        return await updateUser(event.body ? JSON.parse(event.body) : {}, sub);
      default:
        console.error("Unsupported method:", method);
        return {
          statusCode: 405,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: "Method not allowed" }),
        };
    }
  } catch (error) {
    console.error("=== ERROR in UserHandler ===");
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  } finally {
    console.log("=== UserHandler END ===");
  }
};
