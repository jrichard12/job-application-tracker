import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import "./Login.scss";

function Login() {
    return (
        <Card className="login">
            <CardContent>
                <Typography variant="h5" component="div">
                    Login
                </Typography>
                <form>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default Login;