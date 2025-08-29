import { useState, useEffect } from "react";
import { Paper, Typography, FormControlLabel, Checkbox, Button, Box, Card, CardContent } from "@mui/material";
import { useAuth } from "../../services/authService";
import type { UserInfo } from "../../types/UserInfo";
import "./Dashboard.scss";

interface DashboardProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Dashboard({ userInfo, updateUser }: DashboardProps) {
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
        console.log("=== handleSaveChanges called ===");
        console.log("userInfo:", userInfo);
        console.log("notifications value:", notifications);
        console.log("demoMode:", demoMode);
        
        if (!userInfo) return;

        if (demoMode) {
            // For demo mode, just update local state
            updateUser({
                ...userInfo,
                sendNotifications: notifications
            });
            setHasChanges(false);
            return;
        }

        try {
            const userInfoHandlerUrl = import.meta.env.VITE_USER_INFO_URL;
            
            if (!user?.authToken) {
                console.error("No auth token found");
                return;
            }

            console.log("Saving user preferences:", { sendNotifications: notifications });
            console.log("Using URL:", userInfoHandlerUrl);
            console.log("Auth token:", user.authToken);
            console.log("Request payload:", {
                userId: userInfo.id,
                sendNotifications: notifications
            });

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

            console.log("Update response status:", response.status);
            console.log("Update response headers:", response.headers);

            if (response.status !== 200) {
                const errorText = await response.text();
                console.error("Update failed with status:", response.status, "Error:", errorText);
                throw new Error(`Failed to update user preferences: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log("Update response data:", responseData);

            console.log("User preferences updated successfully");

            updateUser({
                ...userInfo,
                sendNotifications: notifications
            });
            setHasChanges(false);
        } catch (error) {
            console.error("Error saving user preferences:", error);
        }
    };

    const stats = userInfo?.stats || {
        totalJobsApplied: userInfo?.jobApps?.filter(job => job.dateApplied !== null).length || 0,
        totalInterviews: userInfo?.jobApps?.filter(job => job.interviewed === true).length || 0,
        totalRejections: userInfo?.jobApps?.filter(job => job.jobStatus === 'Rejected').length || 0,
        totalOffers: userInfo?.jobApps?.filter(job => job.jobStatus === 'Offered' || job.jobStatus === 'Accepted').length || 0,
        responseRate: 0,
        avgResponseTime: 0
    };

    // Calculate response rate
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
                {/* Header */}
                <Paper className="dashboard-header" elevation={24}>
                    <div className="header-toolbar">
                        <Typography variant="h4" fontFamily={"var(--font-family)"} fontWeight="bold" className="page-title">
                            Dashboard
                        </Typography>
                    </div>
                </Paper>

                {/* Stats Cards */}
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

                {/* User Profile Section */}
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

                        <div className="user-info">
                            <Typography variant="h6" className="info-label">
                                Member Since:
                            </Typography>
                            <Typography variant="body1" className="info-value">
                                {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
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
        </div>
    );
}

export default Dashboard;
