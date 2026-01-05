/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import type { CognitoUser } from "amazon-cognito-identity-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, useAuth } from "../../services/authService";
import { getDemoUserJobs } from "../../services/demoUserService";
import { ExtensionCommunicator } from "../../services/extensionCommunicator";
import type { JobApp } from "../../types/JobApp";
import { type UserInfo } from "../../types/UserInfo";
import "./Login.scss";
import { getUser } from "../../services/userService";

interface LoginProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function Login({ updateUser }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPasswordRequired, setNewPasswordRequired] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const { setUser, setDemoMode } = useAuth();
    const navigate = useNavigate();

    const handleNewPasswordRequired = (user: CognitoUser) => {
        setCognitoUser(user);
        setNewPasswordRequired(true);
        setLoading(false); // Stop the loading spinner when password reset is required
    }

    const handleSubmitNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!newPassword || !confirmPassword) {
            setError("Please enter and confirm your new password.");
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (!cognitoUser) {
            setLoading(false);
            return;
        }

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

                const data: UserInfo | null = await getUser(authToken);
                updateUser(data || null);

                navigate("/");
            },
            onFailure: (err) => {
                setLoading(false);
                alert(err.message || JSON.stringify(err));
            },
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Authenticate user
            const result = await loginUser(username, password, handleNewPasswordRequired);
            const authToken = result.authToken;
            const id = result.userId;
            const userData = { username, authToken, id };
            setUser(userData);

            // Update extension
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

            // Fetch user profile/update state
            const data: UserInfo | null = await getUser(authToken);
            updateUser(data || null);

            // Navigate to home
            navigate("/")
        } catch (err: any) {
            setError(err.message || "Login failed");
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError("");
        setLoading(true);
        setDemoMode(true);
        try {
            const result = await loginUser("", "", handleNewPasswordRequired, true);
            console.log("Login successful:", result);
            const authToken = result.authToken;
            const id = result.userId;
            const loadedJobApps: JobApp[] = getDemoUserJobs();
            setUser({ username: 'demo@example.com', authToken, id });
            updateUser({
                id: id,
                email: 'demo@example.com',
                jobApps: loadedJobApps,
                jobsLoaded: true
            } as UserInfo);
            console.log("Demo user login activated");
            setLoading(false);
            navigate("/");
        } catch (err: any) {
            console.error("Demo login error:", err);
            setError(err.message || "Demo login failed");
            setLoading(false);
        }
    };

    return (
        <>
            {loading && (
                <div className="login-loading-overlay">
                    <div className="loading-box">
                        <CircularProgress color="primary" />
                        <Typography variant="h6" component="div" className="loading-text">
                            Logging you in...
                        </Typography>
                    </div>
                </div>
            )}
            {!loading &&
                <>
                    <Card className="login">
                        <CardContent>
                            <Typography variant="h5" component="div">
                                Login
                            </Typography><form onSubmit={newPasswordRequired ? handleSubmitNewPassword : handleSubmit}>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={newPasswordRequired}
                                    value={username} />
                                <TextField
                                    label={newPasswordRequired ? "New Password" : "Password"}
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                    onChange={newPasswordRequired ? (e) => setNewPassword(e.target.value) : (e) => setPassword(e.target.value)}
                                    value={newPasswordRequired ? newPassword : password} />
                                {newPasswordRequired && (
                                    <TextField
                                        label="Confirm New Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        required
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        value={confirmPassword} />
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
                            style={{
                                color: '#432371',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem'
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDemoLogin();
                            }}
                        >
                            Login as demo user
                        </a>
                    </div>
                </>
            }
        </>
    );
}

export default Login;