import { loginUser } from "../../services/authService";
import "./Main.scss";
import { useAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function Main() {
    const { setUser, setDemoMode, demoMode } = useAuth();
    const navigate = useNavigate();

    const handleDemoLogin = async () => {
        setDemoMode(true);
        const result = await loginUser("", "", () => { }, true);
        console.log("Login successful:", result);
        const authToken = result.authToken;
        const id = result.userId;
        setUser({ username: 'DemoUser', authToken, id });
        console.log("Demo user login activated");
    };

    return (
        <>
            {
                demoMode ? (
                    <div className="main-container">
                        <h1>Demo Mode Active</h1>
                        <p>You are currently logged in as a demo user.</p>
                        <p>Explore the application features without affecting real data.</p>
                        <Button variant="contained" color="primary" onClick={() => navigate("/applications")}>
                            Go to Applications
                        </Button>
                    </div>
                ) : (
                    <div className="main-container">
                        <h1>Welcome to Job Application Tracker</h1>
                        <p>Your personal tool to manage and track your job applications efficiently.</p>
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <a
                                href="#"
                                style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                                onClick={(e) => { e.preventDefault(); handleDemoLogin(); }}
                            >
                                Login as demo user
                            </a>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default Main;