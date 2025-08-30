import { Button } from "@mui/material";
import { loginUser, useAuth } from "../../services/authService";
import { getDemoUserJobs } from "../../services/demoUserService";
import type { UserInfo } from "../../types/UserInfo";
import "./Main.scss";
import { useState } from 'react';
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';

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
        showSnackbar('Demo data reset', 'success');
    }

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setSnackbar({ open: true, message, severity });
    }

    const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
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
                                style={{ color: '#432371', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                                onClick={(e) => { e.preventDefault(); handleDemoLogin(); }}
                            >
                                Login as demo user
                            </a>
                        </div>
                    </div>
                )
            }
            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </>
    );
}


export default Main;