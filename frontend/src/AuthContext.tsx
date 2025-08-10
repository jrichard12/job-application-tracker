/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type ReactNode } from 'react';
import { userPool, AuthContext } from './services/authService';
import { type User } from './types/User';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [demoMode, setDemoMode] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

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
                setUser({
                    username: currentUser.getUsername(),
                    authToken: session.getIdToken().getJwtToken(),
                    id: session.getIdToken().payload.sub
                });
            } else {
                console.error("Session is not valid:", err);
                setUser(null);
            }
            setCheckingSession(false);
        });
    }, [demoMode]);

    if (checkingSession) return null;

    return (
        <AuthContext.Provider value={{ user, setUser, demoMode, setDemoMode }}>
            {children}
        </AuthContext.Provider>
    );
};

