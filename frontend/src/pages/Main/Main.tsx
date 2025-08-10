import { loginUser } from "../../services/authService";
import "./Main.scss";
import { getDemoUserJobs } from "../../services/demoUserService";
import { useAuth } from "../../services/authService";
import { Button } from "@mui/material";
import type { UserInfo } from "../../types/UserInfo";

interface MainProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Main({ userInfo, updateUser }: MainProps) {
    const { setUser, setDemoMode, demoMode } = useAuth();

    const handleDemoLogin = async () => {
        setDemoMode(true);
        const result = await loginUser("", "", () => { }, true);
        console.log("Login successful:", result);
        const authToken = result.authToken;
        const id = result.userId;
        setUser({ username: 'DemoUser', authToken, id });
        const loadedJobApps = getDemoUserJobs();
        updateUser({
            id: id,
            email: 'DemoUser',
            jobApps: loadedJobApps
        } as UserInfo);
        console.log("Demo user login activated");
    };

    const handleResetData = () => {
        const loadedJobApps = getDemoUserJobs();
        updateUser({
            ...userInfo,
            jobApps: loadedJobApps
        } as UserInfo);
    }

    return (
        <>
            {
                demoMode ? (
                    <div className="main-container">
                        <h1>Demo Mode Active</h1>
                        <p>You are currently logged in as a demo user.</p>
                        <p>Explore the application features, but beware any changes you make will not persist on logout.</p>
                        <p>Click the button below to reset the demo data.</p>
                        <Button variant="contained" color="primary" onClick={handleResetData}>
                            Reset Demo Data
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