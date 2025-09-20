import { Button, Paper, Typography, Alert, IconButton, Tooltip } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useState } from "react";
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';
import ProfileSettingsDialog from '../../components/ProfileSettingsDialog/ProfileSettingsDialog';
import ResponseRateBarChart from '../../components/Charts/ResponseRateBarChart';
import ApplicationTrendLineChart from '../../components/Charts/ApplicationTrendLineChart';
import InsightCard from '../../components/Charts/InsightCard';
import CombinedStatsCard from '../../components/Charts/CombinedStatsCard';
import UpcomingDatesCard from '../../components/Charts/UpcomingDatesCard';
import { useAuth } from "../../services/authService";
import { getDemoUserJobs } from "../../services/demoUserService";
import type { UserInfo } from "../../types/UserInfo";
import "./Dashboard.scss";

interface DashboardProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

export function Dashboard({ userInfo, updateUser }: DashboardProps) {
    const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
    const { demoMode, user } = useAuth();

    const handleSaveChanges = async (newNotifications: boolean) => {
        if (!userInfo) return;

        if (demoMode) {
            updateUser({
                ...userInfo,
                sendNotifications: newNotifications
            });
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
                    sendNotifications: newNotifications
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
                sendNotifications: newNotifications
            });
            showSnackbar('Notification preferences updated successfully', 'success');
        } catch (error) {
            console.error("Error saving user preferences:", error);
            showSnackbar('Failed to update notification preferences', 'error');
            throw error;
        }
    };

    const handleResetData = () => {
        if (!userInfo) return;

        const loadedJobApps = getDemoUserJobs();
        updateUser({
            ...userInfo,
            jobApps: loadedJobApps
        });
        showSnackbar('Demo data reset successfully', 'success');
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

    if (!userInfo) {
        return (
            <div className="dashboard">
                <Paper className="dashboard-container" elevation={24}>
                    <Typography variant="h5" className="dashboard-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
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
                        <Typography variant="h4" className="page-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif', fontWeight: 'bold' }}>
                            Dashboard
                        </Typography>
                        <Tooltip title="Profile Settings" arrow>
                            <IconButton
                                onClick={() => setSettingsDialogOpen(true)}
                                className="settings-button"
                                aria-label="Open Settings"
                            >
                                <Settings />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Paper>

                {demoMode && (
                    <Paper className="demo-info-section" elevation={3}>
                        <Alert severity="info" className="demo-alert" icon={false}>
                            <Typography variant="h6" className="demo-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                Demo Mode Active
                            </Typography>
                            <Typography variant="body2" className="demo-description" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                You are currently logged in as a demo user. Explore the application features,
                                but any changes you make will not persist on logout.
                            </Typography>
                            <Typography variant="body2" className="demo-description" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                Clicking the button below will revert any changes you have made and reset the demo data back to its original state.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleResetData}
                                className="reset-demo-button"
                                size="small"
                            >
                                Reset Demo Data
                            </Button>
                        </Alert>
                    </Paper>
                )}

                <div className="overview-section">
                    <Typography variant="h5" className="section-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                        General Overview
                    </Typography>
                    
                    <div className="overview-grid">
                        <div className="fade-in-up fade-in-up--delay-1">
                            <InsightCard userInfo={userInfo} />
                        </div>
                        
                        <div className="fade-in-up fade-in-up--delay-2">
                            <UpcomingDatesCard userInfo={userInfo} />
                        </div>
                    </div>
                </div>

                <div className="charts-section">
                    <Typography variant="h5" className="section-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                        Analytics & Insights
                    </Typography>
                    
                    <div className="charts-grid">
                        <div className="fade-in-up fade-in-up--delay-3 chart-card--full-width">
                            <CombinedStatsCard userInfo={userInfo} />
                        </div>
                        
                        <div className="fade-in-up fade-in-up--delay-4 chart-card--full-width">
                            <ApplicationTrendLineChart userInfo={userInfo} />
                        </div>
                        
                        <div className="fade-in-up fade-in-up--delay-5 chart-card--full-width">
                            <ResponseRateBarChart userInfo={userInfo} />
                        </div>
                    </div>
                </div>
            </div>
            <ProfileSettingsDialog
                open={settingsDialogOpen}
                onClose={() => setSettingsDialogOpen(false)}
                userInfo={userInfo}
                onSave={handleSaveChanges}
            />
            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </div>
    );
}

export default Dashboard;
