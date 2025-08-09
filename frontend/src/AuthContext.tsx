/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type ReactNode } from 'react';
import { userPool, AuthContext } from './services/authService';
import { type User } from './types/User';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
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
                setUser(null);
            }
            setCheckingSession(false);
        });
    }, []);

    if (checkingSession) return null;

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

