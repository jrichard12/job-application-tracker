import { type UserInfo } from "../types/UserInfo";

const userApiUrl = `${import.meta.env.VITE_API_URL}/user`;

const getUser = async (authToken: string): Promise<UserInfo | null> => {
  try {
    const response = await fetch(userApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch user info (${response.status})`
      );
    }

    const data = await response.json();

    // Lambda returns null if user doesn't exist
    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      sendNotifications: data.sendNotifications || false,
    } as UserInfo;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const createUser = async (authToken: string): Promise<UserInfo> => {
  try {
    const response = await fetch(userApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create user (${response.status})`
      );
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      sendNotifications: data.sendNotifications || false,
    } as UserInfo;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const updateUser = async (
  authToken: string,
  updateData: Partial<UserInfo>
): Promise<{ message: string }> => {
  try {
    const response = await fetch(userApiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update user (${response.status})`
      );
    }

    const result: { message: string } = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export { getUser, createUser, updateUser };
