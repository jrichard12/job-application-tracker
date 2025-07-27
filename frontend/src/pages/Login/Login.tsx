/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { loginUser } from "../../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authService";
import "./Login.scss";
import type { CognitoUser } from "amazon-cognito-identity-js";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPasswordRequired, setNewPasswordRequired] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();

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
            onSuccess: (result) => {
                setNewPasswordRequired(false);
                setCognitoUser(null);
                const authToken = result.getIdToken().getJwtToken();
                setUser({ username, authToken });
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
            const authToken = await loginUser(username, password, handleNewPasswordRequired);
            setUser({ username, authToken });
            navigate("/applications");
        } catch (err: any) {
            setError(err.message || "Login failed");
        }
    };

    return (
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
    );
}

export default Login;