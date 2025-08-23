/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type ReactNode } from 'react';
import { userPool, AuthContext } from './services/authService';
import { type User } from './types/User';
import { ExtensionCommunicator } from './services/extensionCommunicator';

interface AuthProviderProps {
    children: ReactNode;
}

// Helper function to send tokens to extension
const sendTokensToExtension = async (user: User, session?: any) => {
    try {
        if (ExtensionCommunicator.isExtensionAvailable() && user.authToken && user.id && user.username) {
            const tokens = {
                idToken: user.authToken,
                accessToken: session?.getAccessToken()?.getJwtToken() || user.authToken,
                refreshToken: session?.getRefreshToken()?.getToken() || '',
                userId: user.id,
                username: user.username,
                expiresAt: session?.getIdToken()?.getExpiration() ? 
                    session.getIdToken().getExpiration() * 1000 : 
                    Date.now() + (24 * 60 * 60 * 1000) // Default 24 hours
            };
            await ExtensionCommunicator.sendTokensToExtension(tokens);
        }
    } catch (error) {
        console.log('Extension not available or error sending tokens:', error);
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [demoMode, setDemoMode] = useState(() => {
        // Check localStorage for demo mode state on initialization
        return localStorage.getItem('demoMode') === 'true';
    });
    const [checkingSession, setCheckingSession] = useState(true);

    // Persist demo mode state to localStorage
    useEffect(() => {
        if (demoMode) {
            localStorage.setItem('demoMode', 'true');
        } else {
            localStorage.removeItem('demoMode');
        }
    }, [demoMode]);

    useEffect(() => {
        if (demoMode) {
            setUser({
                username: "demo@demo.com",
                authToken: "demo-token-123",
                id: "demo-user-id"
            });
            setCheckingSession(false);
            return;
        }
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            setUser(null);
            setCheckingSession(false);
            return;
        }
        currentUser.getSession((err: any, session: any) => {
            if (session?.isValid()) {
                const userData = {
                    username: currentUser.getUsername(),
                    authToken: session.getIdToken().getJwtToken(),
                    id: session.getIdToken().payload.sub
                };
                setUser(userData);
                // Send tokens to extension after setting user
                sendTokensToExtension(userData, session);
            } else {
                console.error("Session is not valid:", err);
                setUser(null);
            }
            setCheckingSession(false);
        });
    }, [demoMode]);

    // Watch for user logout and clear extension tokens
    useEffect(() => {
        if (user === null && !demoMode && !checkingSession) {
            // User has been logged out, clear extension tokens
            try {
                ExtensionCommunicator.clearExtensionTokens();
                console.log('Extension tokens cleared on logout');
            } catch (error) {
                console.log('Extension not available or error clearing tokens on logout:', error);
            }
        }
    }, [user, demoMode, checkingSession]);

    if (checkingSession) return null;

    return (
        <AuthContext.Provider value={{ user, setUser, demoMode, setDemoMode }}>
            {children}
        </AuthContext.Provider>
    );
};

