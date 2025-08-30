import { Box, Button, Card, CardContent, Checkbox, FormControlLabel, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';
import { useAuth } from "../../services/authService";
import type { UserInfo } from "../../types/UserInfo";
import "./Dashboard.scss";

interface DashboardProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

export function Dashboard({ userInfo, updateUser }: DashboardProps) {
    const [notifications, setNotifications] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const { demoMode, user } = useAuth();

    useEffect(() => {
        if (userInfo) {
            setNotifications(userInfo.sendNotifications || false);
        }
    }, [userInfo]);

    const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setNotifications(newValue);
        setHasChanges(newValue !== (userInfo?.sendNotifications || false));
    };

    const handleSaveChanges = async () => {        
        if (!userInfo) return;

        if (demoMode) {
            updateUser({
                ...userInfo,
                sendNotifications: notifications
            });
            setHasChanges(false);
            showSnackbar('Notification preferences updated', 'success');
            return;
        }

        try {
            const userInfoHandlerUrl = import.meta.env.VITE_USER_INFO_URL;
            
            if (!user?.authToken) {
                console.error("No auth token found");
                return;
            }

            const response = await fetch(userInfoHandlerUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.authToken}`
                },
                body: JSON.stringify({
                    userId: userInfo.id,
                    sendNotifications: notifications
                })
            });

            if (response.status !== 200) {
                const errorText = await response.text();
                console.error("Update failed with status:", response.status, "Error:", errorText);
                throw new Error(`Failed to update user preferences: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log("Update response data:", responseData);

            updateUser({
                ...userInfo,
                sendNotifications: notifications
            });
            setHasChanges(false);
            showSnackbar('Notification preferences updated', 'success');
        } catch (error) {
            console.error("Error saving user preferences:", error);
            showSnackbar('Failed to update notification preferences', 'error');
        }
    };

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

    // Stats
    const stats = userInfo?.stats || {
        totalJobsApplied: userInfo?.jobApps?.filter(job => job.dateApplied !== null).length || 0,
        totalInterviews: userInfo?.jobApps?.filter(job => job.interviewed === true).length || 0,
        totalRejections: userInfo?.jobApps?.filter(job => job.jobStatus === 'Rejected').length || 0,
        totalOffers: userInfo?.jobApps?.filter(job => job.jobStatus === 'Offered' || job.jobStatus === 'Accepted').length || 0,
        responseRate: 0,
        avgResponseTime: 0
    };

    // Calculated stats
    const appliedJobs = stats.totalJobsApplied;
    const respondedJobs = stats.totalInterviews + stats.totalRejections + stats.totalOffers;
    const responseRate = appliedJobs > 0 ? Math.round((respondedJobs / appliedJobs) * 100) : 0;

    const statCards = [
        { title: "Total Applications", value: stats.totalJobsApplied, color: "primary" },
        { title: "Interviews", value: stats.totalInterviews, color: "secondary" },
        { title: "Offers", value: stats.totalOffers, color: "success" },
        { title: "Rejections", value: stats.totalRejections, color: "error" },
        { title: "Response Rate", value: `${responseRate}%`, color: "tertiary" }
    ];

    if (!userInfo) {
        return (
            <div className="dashboard">
                <Paper className="dashboard-container" elevation={24}>
                    <Typography variant="h5" className="dashboard-title">
                        Loading Dashboard...
                    </Typography>
                </Paper>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-content">
                <Paper className="dashboard-header" elevation={24}>
                    <div className="header-toolbar">
                        <Typography variant="h4" fontFamily={"var(--font-family)"} fontWeight="bold" className="page-title">
                            Dashboard
                        </Typography>
                    </div>
                </Paper>

                <div className="stats-section">
                    <Typography variant="h5" className="section-title">
                        Your Statistics
                    </Typography>
                    <div className="stats-grid">
                        {statCards.map((stat, index) => (
                            <Card key={index} className={`stat-card stat-card--${stat.color}`} elevation={3}>
                                <CardContent className="stat-content">
                                    <Typography variant="h3" className="stat-value">
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" className="stat-title">
                                        {stat.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Paper className="profile-section" elevation={3}>
                    <Typography variant="h5" className="section-title">
                        Profile Settings
                    </Typography>

                    <div className="profile-content">
                        <div className="user-info">
                            <Typography variant="h6" className="info-label">
                                Email:
                            </Typography>
                            <Typography variant="body1" className="info-value">
                                {userInfo.email}
                            </Typography>
                        </div>

                        <div className="notification-settings">
                            <Typography variant="h6" className="settings-title">
                                Notification Preferences
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={notifications}
                                        onChange={handleNotificationChange}
                                        className="notification-checkbox"
                                    />
                                }
                                label="Receive email notifications about application updates"
                                className="notification-control"
                            />
                        </div>

                        {hasChanges && (
                            <Box className="save-section">
                                <Button
                                    variant="contained"
                                    onClick={handleSaveChanges}
                                    className="save-button"
                                    size="large"
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        )}
                    </div>
                </Paper>
            </div>
                <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </div>
    );
}

export default Dashboard;
