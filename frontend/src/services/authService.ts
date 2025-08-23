import { useContext, createContext } from "react";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { COGNITO_CONFIG } from "../config/congitoConfig";
import { type User } from "../types/User";
import { ExtensionCommunicator } from "./extensionCommunicator";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  demoMode: boolean;
  setDemoMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const poolData = {
  UserPoolId: COGNITO_CONFIG.UserPoolId,
  ClientId: COGNITO_CONFIG.ClientId,
};

export const userPool = new CognitoUserPool(poolData);

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function loginUser(
  username: string,
  password: string,
  handleNewPasswordRequired: (user: CognitoUser) => void,
  demoMode?: boolean
): Promise<{ authToken: string; userId: string }> {
  if (demoMode) {
    // Return demo user and token
    return Promise.resolve({
      authToken: "demo-token-123",
      userId: "demo-user-id"
    });
  }

  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const authToken = result.getIdToken().getJwtToken();
        const userId = result.getIdToken().payload.sub;
        resolve({ authToken, userId });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log(
          "New password required:",
          userAttributes,
          requiredAttributes
        );
        handleNewPasswordRequired(user);
      },
    });
  });
}

export function logoutUser() {
  const userPool = new CognitoUserPool({
    UserPoolId: COGNITO_CONFIG.UserPoolId,
    ClientId: COGNITO_CONFIG.ClientId,
  });
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
  
  // Clear tokens from extension
  try {
    ExtensionCommunicator.clearExtensionTokens();
  } catch (error) {
    console.log('Extension not available or error clearing tokens:', error);
  }
}

