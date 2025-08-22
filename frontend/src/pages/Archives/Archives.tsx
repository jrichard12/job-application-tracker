import JobAppList from "../../components/JobAppList/JobAppList";
import JobAppsListView from "../../components/JobAppsListView/JobAppsListView";
import "./Archives.scss";
import type { JobApp } from "../../types/JobApp";
import { useState, useEffect } from "react";
import JobDetails from "../../components/JobDetails/JobDetails";
import { Typography, IconButton, Tooltip } from "@mui/material";
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { type UserInfo } from "../../types/UserInfo";

interface ArchivesProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Archives({ userInfo, updateUser }: ArchivesProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [archivedJobs, setArchivedJobs] = useState<JobApp[]>([]);
    const [isListView, setIsListView] = useState<boolean>(false);

    useEffect(() => {
        const archivedJobs: JobApp[] = userInfo?.jobApps?.filter(job => job.isArchived) || [];
        setArchivedJobs([...archivedJobs]);
    }, [userInfo]);


    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
        console.log("Showing details for job:", job);
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
        </div>
    );
}

export default Archives;