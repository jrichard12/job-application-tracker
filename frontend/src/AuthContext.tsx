/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { userPool, AuthContext } from './services/authService';
import { type User } from './types/User';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = userPool.getCurrentUser();

        currentUser?.getSession((err: any, session: any) => {
            if (session?.isValid()) {
                setUser({
                    username: currentUser.getUsername(),
                    authToken: session.getIdToken().getJwtToken()
                });
            } else {
                setUser(null);
                if (window.location.pathname !== '/login') {
                    <Navigate to="/login" replace />
                }
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

