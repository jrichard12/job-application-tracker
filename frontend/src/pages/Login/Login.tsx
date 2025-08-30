/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { loginUser } from "../../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authService";
import "./Login.scss";
import type { CognitoUser } from "amazon-cognito-identity-js";
import { type UserInfo } from "../../types/UserInfo";
import type { JobApp } from "../../types/JobApp";
import { getDemoUserJobs } from "../../services/demoUserService";
import { ExtensionCommunicator } from "../../services/extensionCommunicator";

interface LoginProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function Login({ userInfo, updateUser }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleDemoLogin = async () => {
        setDemoMode(true);
        const result = await loginUser(username, password, handleNewPasswordRequired, true);
        console.log("Login successful:", result);
        const authToken = result.authToken;
        const id = result.userId;
        const loadedJobApps: JobApp[] = getDemoUserJobs();
        setUser({ username, authToken, id });
        updateUser({
            id: id,
            email: username,
            jobApps: loadedJobApps
        } as UserInfo);
        console.log("Demo user login activated");
        navigate("/applications");
    };
    const [newPasswordRequired, setNewPasswordRequired] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { user, setUser, setDemoMode } = useAuth();
    const userInfoHandlerUrl = import.meta.env.VITE_USER_INFO_URL;

    const handleNewPasswordRequired = (user: CognitoUser) => {
        setCognitoUser(user);
        setNewPasswordRequired(true);
    }

    const handleSubmitNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newPassword || !confirmPassword) {
            setError("Please enter and confirm your new password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!cognitoUser) return;

        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: async (result) => {
                setNewPasswordRequired(false);
                setCognitoUser(null);
                const authToken = result.getIdToken().getJwtToken();
                const id = result.getIdToken().payload.sub;
                const userData = { username, authToken, id };
                setUser(userData);
                
                try {
                    console.log('[Login] Attempting to send tokens to extension...');
                    await ExtensionCommunicator.sendTokensToExtension({
                        idToken: authToken,
                        userId: id,
                        username: username
                    });
                    console.log('[Login] Tokens sent to extension successfully');
                } catch (error) {
                    console.log('[Login] Extension not available or error sending tokens:', error);
                }
                
                await getUserInfo(username, id, authToken);
                navigate("/applications");
            },
            onFailure: (err) => {
                alert(err.message || JSON.stringify(err));
            },
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            console.log("Attempting to login with username:", username);
            const result = await loginUser(username, password, handleNewPasswordRequired);
            console.log("Login successful:", result);
            const authToken = result.authToken;
            const id = result.userId;
            const userData = { username, authToken, id };
            setUser(userData);
            
            // Send tokens to extension after successful login
            try {
                console.log('[Login] Attempting to send tokens to extension...');
                await ExtensionCommunicator.sendTokensToExtension({
                    idToken: authToken,
                    userId: id,
                    username: username
                });
                console.log('[Login] Tokens sent to extension successfully');
            } catch (error) {
                console.log('[Login] Extension not available or error sending tokens:', error);
            }
            
            await getUserInfo(username, id, authToken);
            console.log(`Login successful, ${userInfo?.createdAt} with ID ${userInfo?.id} authenticated successfully. ${userInfo?.jobApps}`);
            navigate("/applications");
        } catch (err: any) {
            setError(err.message || "Login failed");
        }
    };

    const getUserInfo = async (username: string, id: string, authToken: string) => {
        console.log(user);
        if (username === "" || id === "") {
            console.error("User is not authenticated or user ID is missing.");
            return;
        }
        try {
            const response = await fetch(userInfoHandlerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    userId: id,
                    email: username
                } as any)
            });

            if (response.status !== 200) {
                throw new Error("Failed to fetch user info");
            }

            const data = await response.json();
            updateUser({
                id: data.id,
                email: data.email,
                sendNotifications: data.sendNotifications,
                jobApps: data.jobApps
            } as UserInfo);
            console.log("User jobs fetched successfully:", data.jobApps);
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    return (
        <>
            <Card className="login">
                <CardContent>
                    <Typography variant="h5" component="div">
                        Login
                    </Typography>
                    <form onSubmit={newPasswordRequired ? handleSubmitNewPassword : handleSubmit}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={newPasswordRequired}
                            value={username}
                        />
                        <TextField
                            label={newPasswordRequired ? "New Password" : "Password"}
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            onChange={newPasswordRequired ? (e) => setNewPassword(e.target.value) : (e) => setPassword(e.target.value)}
                            value={newPasswordRequired ? newPassword : password}
                        />
                        {newPasswordRequired && (
                            <TextField
                                label="Confirm New Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                required
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                            />
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            type="submit"
                            style={{ marginTop: '18px' }}
                        >
                            {newPasswordRequired ? "Set New Password" : "Login"}
                        </Button>
                        {error && (
                            <div style={{ color: '#d32f2f', fontSize: '0.95rem', marginTop: '12px', textAlign: 'center', fontWeight: 500 }}>
                                {error}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <a
                    href="#"
                    style={{ color: '#432371', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                    onClick={(e) => { e.preventDefault(); handleDemoLogin(); }}
                >
                    Login as demo user
                </a>
            </div>
        </>
    );
}

export default Login;