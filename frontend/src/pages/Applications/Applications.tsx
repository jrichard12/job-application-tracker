import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SyncIcon from '@mui/icons-material/Sync';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { CircularProgress, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';
import { getDemoUserJobs } from '../../services/demoUserService';
import CreateAppModal from "../../components/CreateAppModal/CreateAppModal";
import JobAppList from "../../components/JobAppList/JobAppList";
import JobAppsListView from "../../components/JobAppsListView/JobAppsListView";
import JobDetails from "../../components/JobDetails/JobDetails";
import { useAuth } from "../../services/authService";
import type { JobApp } from "../../types/JobApp";
import { type UserInfo } from "../../types/UserInfo";
import "./Applications.scss";

interface ApplicationsProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function Applications({ userInfo, updateUser }: ApplicationsProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [jobs, setJobs] = useState<JobApp[]>([]);
    const [isListView, setIsListView] = useState<boolean>(false);
    const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

    const { user, demoMode } = useAuth();
    const jobHandlerUrl = import.meta.env.VITE_JOB_HANDLER_URL;

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

    // Initial data fetch on mount (only if jobs aren't already loaded)
    useEffect(() => {
        const fetchInitialJobs = async () => {
            // Skip if already loaded from backend
            if (initialLoadComplete || userInfo?.jobsLoaded) {
                setInitialLoadComplete(true);
                return;
            }

            if (!user?.id || !user?.authToken) {
                return;
            }

            setRefreshLoading(true);

            if (demoMode) {
                const loaded = getDemoUserJobs();
                updateUser({ ...userInfo, jobApps: loaded, jobsLoaded: true } as UserInfo);
                setRefreshLoading(false);
                setInitialLoadComplete(true);
                return;
            }

            try {
                const response = await fetch(`${jobHandlerUrl}?userId=${user.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.authToken}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch jobs (${response.status})`);
                }
                
                const jobsData: JobApp[] = await response.json();
                updateUser({ ...userInfo, jobApps: jobsData, jobsLoaded: true } as UserInfo);
            } catch (error) {
                console.error("Error fetching initial job applications:", error);
                showSnackbar('Failed to load jobs', 'error');
            } finally {
                setRefreshLoading(false);
                setInitialLoadComplete(true);
            }
        };

        fetchInitialJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.authToken, demoMode, initialLoadComplete]);

    useEffect(() => {
        const activeJobs: JobApp[] = userInfo?.jobApps?.filter(job => !job.isArchived) || [];
        setJobs([...activeJobs]);
        
        // Clear selection if the currently selected job is no longer available (archived/deleted)
        if (currentJobDetails && (!userInfo?.jobApps?.find(job => job.id === currentJobDetails.id) || 
            userInfo.jobApps.find(job => job.id === currentJobDetails.id)?.isArchived)) {
            setCurrentJobDetails(undefined);
            setSearchParams({});
        }
    }, [userInfo, currentJobDetails, setSearchParams]);

    // Handle jobId URL parameter for direct navigation from dashboard
    useEffect(() => {
        const jobId = searchParams.get('jobId');
        if (jobId && userInfo?.jobApps) {
            const targetJob = userInfo.jobApps.find(job => job.id === jobId && !job.isArchived);
            if (targetJob) {
                setCurrentJobDetails(targetJob);
            } else {
                // Job not found or archived, clear the invalid URL parameter
                setSearchParams({});
            }
        }
    }, [searchParams, userInfo, setSearchParams]);

    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
        // Update URL parameter to keep it in sync with the selected job
        setSearchParams({ jobId: job.id });
    };

    const createApp = async (jobApp: JobApp | null) => {
        console.log(jobApp);
        if (!jobApp) {
            console.error("No job app defined.");
            showSnackbar('No job application data provided', 'error');
            return;
        }

        if (!demoMode && !user?.authToken) {
            showSnackbar('Authentication required to create job', 'error');
            return;
        }

        if (!demoMode && !user?.id) {
            showSnackbar('User ID not available', 'error');
            return;
        }

        if (demoMode) {
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps || [], jobApp]
            } as UserInfo);
            setCurrentJobDetails(jobApp);
            setCreateModalOpen(false);
            showSnackbar('Job application created', 'success');
            return;
        }

        try {
            const response = await fetch(jobHandlerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user!.authToken}`
                },
                body: JSON.stringify({
                    userId: user!.id,
                    job: jobApp
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to create job (${response.status})`);
            }

            const data = await response.json();
            console.log("Job application created:", data);
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps || [], data]
            } as UserInfo);
            setCurrentJobDetails(data);
            setCreateModalOpen(false);
            showSnackbar('Job application created successfully', 'success');
        } catch (error) {
            console.error("Error creating job application:", error);
            showSnackbar(error instanceof Error ? error.message : 'Failed to create job application', 'error');
            setCreateModalOpen(false);
        }
    };

    async function handleRefreshJobs(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        event.preventDefault();
        if (!userInfo) {
            showSnackbar('No user information available', 'error');
            return;
        }

        if (!user?.authToken) {
            showSnackbar('Authentication required to refresh jobs', 'error');
            return;
        }

        if (!user?.id) {
            showSnackbar('User ID not available', 'error');
            return;
        }

        setRefreshLoading(true);

        if (demoMode) {
            // Add a small delay to show the spinner for demo mode
            await new Promise(resolve => setTimeout(resolve, 800));
            const loaded = getDemoUserJobs();
            updateUser({ ...userInfo, jobApps: loaded, jobsLoaded: true });
            const activeJobs = loaded.filter(job => !job.isArchived);
            setJobs([...activeJobs]);
            setCurrentJobDetails(undefined);
            // Clear URL parameters when refreshing
            setSearchParams({});
            showSnackbar('Demo data reset', 'success');
            setRefreshLoading(false);
            return;
        }

        try {
            const response = await fetch(`${jobHandlerUrl}?userId=${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.authToken}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch jobs (${response.status})`);
            }
            const jobsData: JobApp[] = await response.json();
            const activeJobs = jobsData.filter(job => !job.isArchived);
            setJobs([...activeJobs]);
            setCurrentJobDetails(undefined);
            // Clear URL parameters when refreshing
            setSearchParams({});
            updateUser({ ...userInfo, jobApps: jobsData, jobsLoaded: true });
            showSnackbar('Jobs refreshed', 'success');
        } catch (error) {
            console.error("Error refreshing job applications:", error);
            showSnackbar('Failed to refresh jobs', 'error');
        } finally {
            setRefreshLoading(false);
        }
    }

    return (
        <div className="applications">
            <CreateAppModal
                isOpen={createModalOpen}
                handleClose={() => setCreateModalOpen(false)}
                handleCreateApp={createApp}>
            </CreateAppModal>
            <Paper className="job-apps" elevation={24}>
                <div className="apps-tool-bar">
                    <div className="page-title">
                        <Typography variant="h5" fontFamily={"var(--font-family)"} fontWeight="bold">
                            Your Applications
                        </Typography>
                    </div>
                    <div className="toolbar-actions">
                        <div className="view-toggle-buttons">
                            <Tooltip title="Card View">
                                <IconButton
                                    className={`view-toggle-btn ${!isListView ? 'active' : ''}`}
                                    onClick={() => setIsListView(false)}
                                    size="small"
                                >
                                    <ViewModuleIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="List View">
                                <IconButton
                                    className={`view-toggle-btn ${isListView ? 'active' : ''}`}
                                    onClick={() => setIsListView(true)}
                                    size="small"
                                >
                                    <ViewListIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="refresh-button-container">
                            <Tooltip title="Refresh Jobs">
                                <IconButton
                                    className={`refresh-btn`}
                                    onClick={handleRefreshJobs}
                                    size="small"
                                    disabled={refreshLoading}
                                >
                                    <SyncIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="add-app-button">
                            <button className="modern-add-btn" onClick={() => setCreateModalOpen(true)}>
                                <AddCircleOutlineIcon fontSize="medium" style={{ marginRight: 6 }} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`job-apps-content ${isListView ? 'list-view' : ''}`}>
                    {refreshLoading && (
                        <div className="refresh-loading-overlay">
                            <div className="loading-box">
                                <CircularProgress color="primary" />
                                <Typography variant="h6" component="div" className="loading-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                    Loading jobs...
                                </Typography>
                            </div>
                        </div>
                    )}
                    {isListView ? (
                        <JobAppsListView jobs={jobs} />
                    ) : (
                        <>
                            <JobAppList jobDetailsHandler={handleShowDetails} jobs={jobs} currentJob={currentJobDetails ?? null} />
                            <JobDetails
                                job={currentJobDetails ?? null}
                                userInfo={userInfo ?? null}
                                updateUser={updateUser ?? null}
                            />
                        </>
                    )}
                </div>
            </Paper>
            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </div>
    );
}

export default Applications;