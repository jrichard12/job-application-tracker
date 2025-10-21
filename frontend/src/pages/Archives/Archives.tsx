import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SnackbarAlert from '../../components/SnackbarAlert/SnackbarAlert';
import { getDemoUserJobs } from '../../services/demoUserService';
import JobAppList from "../../components/JobAppList/JobAppList";
import JobAppsListView from "../../components/JobAppsListView/JobAppsListView";
import JobDetails from "../../components/JobDetails/JobDetails";
import { useAuth } from "../../services/authService";
import type { JobApp } from "../../types/JobApp";
import { type UserInfo } from "../../types/UserInfo";
import "./Archives.scss";

interface ArchivesProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Archives({ userInfo, updateUser }: ArchivesProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [archivedJobs, setArchivedJobs] = useState<JobApp[]>([]);
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
        const archivedJobs: JobApp[] = userInfo?.jobApps?.filter(job => job.isArchived) || [];
        setArchivedJobs([...archivedJobs]);
    }, [userInfo]);


    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    };

    return (
        <div className="archives">
            <div className="job-apps">
                <div className="apps-tool-bar">
                    <div className="page-title">
                        <Typography variant="h5" fontFamily={"var(--font-family)"} fontWeight="bold">
                            Archived Applications
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
                        <JobAppsListView jobs={archivedJobs} />
                    ) : (
                        <>
                            <JobAppList jobDetailsHandler={handleShowDetails} jobs={archivedJobs} currentJob={currentJobDetails ?? null} />
                            <JobDetails job={currentJobDetails ?? null} userInfo={userInfo ?? null} updateUser={updateUser ?? null} />
                        </>
                    )}
                </div>
            </div>
            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </div>
    );
}

export default Archives;