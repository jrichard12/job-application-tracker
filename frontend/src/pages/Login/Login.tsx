/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import { loginUser } from "../../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authService";
import "./Login.scss";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const authToken = await loginUser(username, password);
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
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                    {error &&
                        <Typography color="error" variant="body2" className="error-message">
                            {error}
                        </Typography>
                    }
                </form>
            </CardContent>
        </Card>
    );
}

export default Login;