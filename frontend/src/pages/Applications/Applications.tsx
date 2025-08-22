import { useEffect, useState } from "react";
import JobAppList from "../../components/JobAppList/JobAppList";
import JobDetails from "../../components/JobDetails/JobDetails";
import JobAppsListView from "../../components/JobAppsListView/JobAppsListView";
import type { JobApp } from "../../types/JobApp";
import "./Applications.scss";
import { Paper, Typography, IconButton, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CreateAppModal from "../../components/CreateAppModal/CreateAppModal";
import { useAuth } from "../../services/authService";
import { type UserInfo } from "../../types/UserInfo";


interface ApplicationsProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function Applications({ userInfo, updateUser }: ApplicationsProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [jobs, setJobs] = useState<JobApp[]>([]);
    const [isListView, setIsListView] = useState<boolean>(false);
    const { user, demoMode } = useAuth();
    const jobHandlerUrl = demoMode ? "demoUrl" : import.meta.env.VITE_JOB_HANDLER_URL;

    useEffect(() => {
        const activeJobs: JobApp[] = userInfo?.jobApps?.filter(job => !job.isArchived) || [];
        setJobs([...activeJobs]);
    }, [userInfo]);

    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    };

    const createApp = async (jobApp: JobApp | null) => {
        console.log(jobApp);
        if (!jobApp) {
            console.error("No job app defined.");
            return;
        }
        if (demoMode) {
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps || [], jobApp]
            } as UserInfo);
            setCurrentJobDetails(jobApp);
            setCreateModalOpen(false);
            return;
        }
        try {
            const response = await fetch(jobHandlerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user?.id,
                    job: jobApp
                })
            });

            if (response.status !== 200) {
                throw new Error("Failed to create job application.");
            }

            const data = await response.json();
            console.log("Job application created:", data);
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps || [], data]
            } as UserInfo);
            setCurrentJobDetails(data);
            setCreateModalOpen(false);
        } catch (error) {
            console.error("Error creating job application:", error);
            setCreateModalOpen(false);
        }
    };

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
                        <div className="add-app-button">
                            <button className="modern-add-btn" onClick={() => setCreateModalOpen(true)}>
                                <AddCircleOutlineIcon fontSize="medium" style={{ marginRight: 6 }} />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`job-apps-content ${isListView ? 'list-view' : ''}`}>
                    {isListView ? (
                        <JobAppsListView jobs={jobs} />
                    ) : (
                        <>
                            <JobAppList jobDetailsHandler={handleShowDetails} jobs={jobs} currentJob={currentJobDetails ?? null} />
                            <JobDetails job={currentJobDetails ?? null} userInfo={userInfo ?? null} updateUser={updateUser ?? null} />
                        </>
                    )}
                </div>
            </Paper>
        </div>
    );
}

export default Applications;