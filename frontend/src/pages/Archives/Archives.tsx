import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, CircularProgress, Container, IconButton, Tooltip, Typography } from "@mui/material";
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
import { getJobs } from '../../services/jobService';
import JobSearchBar from '../../components/JobSearchBar/JobSearchBar';
import { GitHub, LinkedIn } from '@mui/icons-material';

interface ArchivesProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Archives({ userInfo, updateUser }: ArchivesProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [archivedJobs, setArchivedJobs] = useState<JobApp[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<JobApp[]>([]);
    const [isListView, setIsListView] = useState<boolean>(false);
    const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

    const { user, demoMode } = useAuth();

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
                const jobsData: JobApp[] = await getJobs(user.authToken);
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
        setFilteredJobs([...archivedJobs]);
    }, [userInfo]);


    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    };

    const handleSearchResults = (results: JobApp[]) => {
        setFilteredJobs(results);
    };

    return (
        <div className="archives">
            <div className="job-apps">
                <div className="apps-tool-bar">
                    <div className="page-title">
                        <Typography variant="h4" fontFamily={"var(--font-family)"} fontWeight="bold">
                            Archived Applications
                        </Typography>
                    </div>
                    <div className="toolbar-actions">
                        <div className="search-bar-row">
                            <JobSearchBar jobs={archivedJobs} onSearchResults={handleSearchResults} />
                        </div>
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
                        <JobAppsListView jobs={filteredJobs} />
                    ) : (
                        <>
                            <JobAppList jobDetailsHandler={handleShowDetails} jobs={filteredJobs} currentJob={currentJobDetails ?? null} />
                            <JobDetails job={currentJobDetails ?? null} userInfo={userInfo ?? null} updateUser={updateUser ?? null} />
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="footer-section">
                <Container maxWidth="lg">
                    <Box className="footer-content">
                        <div className="footer-links">
                            <IconButton
                                component="a"
                                href="https://www.linkedin.com/in/jessica-richard-7b601789"
                                target="_blank"
                                className="footer-link"
                                aria-label="LinkedIn Profile"
                            >
                                <LinkedIn />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://github.com/jrichard12/job-application-tracker"
                                target="_blank"
                                className="footer-link"
                                aria-label="GitHub Repository"
                            >
                                <GitHub />
                            </IconButton>
                        </div>
                        <Typography variant="body2" className="footer-text">
                            Designed and Built by Jessica Richard
                        </Typography>
                    </Box>
                </Container>
            </footer>

            <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
        </div>
    );
}

export default Archives;