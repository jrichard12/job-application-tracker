/* eslint-disable @typescript-eslint/no-explicit-any */
import JobAppList from "../../components/JobAppList/JobAppList";
import "./Applications.scss";
import type { JobApp } from "../../types/JobApp";
import { useState, useEffect } from "react";
import JobDetails from "../../components/JobDetails/JobDetails";
import AppsToolBar from "../../components/AppsToolBar/AppsToolBar";
//import jobData from "../../demoData.json";
import CreateAppModal from "../../components/CreateAppModal/CreateAppModal";
import { Paper } from "@mui/material";
import { type UserInfo } from "../../types/UserInfo";
import { useAuth } from "../../services/authService";

interface ApplicationsProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function Applications({ userInfo, updateUser }: ApplicationsProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [jobs, setJobs] = useState<JobApp[]>([]);
    const { user } = useAuth();
    const jobHandlerUrl = import.meta.env.VITE_JOB_HANDLER_URL;

    // function parseJobApps(data: any[]): JobApp[] {
    //     return data.map((item) => ({
    //         ...item,
    //         dateApplied: item.dateApplied ? new Date(item.dateApplied) : null,
    //         deadline: item.deadline ? new Date(item.deadline) : null,
    //         statusUpdated: item.statusUpdated ? new Date(item.statusUpdated) : null,
    //     }));
    // }

    useEffect(() => {
        //const loadedJobs: JobApp[] = parseJobApps(jobData);
        const activeJobs: JobApp[] = userInfo?.jobApps?.filter(job => !job.isArchived) || [];
        setJobs([...activeJobs]);
    }, [userInfo]);


    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    };

    // TODO: call lambda to save/del/update the new job app
    const createApp = async (jobApp: JobApp | null) => {
        console.log(jobApp);
        if (!jobApp) {
            console.error("No job app defined.");
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
                } as any)
            });

            if (response.status !== 200) {
                throw new Error("Failed to create job application.");
            }

            const data = await response.json();
            console.log("Job application created:", data);
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps || [], JSON.parse(data)]
            } as UserInfo);
            setCurrentJobDetails(jobApp);
            setCreateModalOpen(false);
        } catch (error) {
            console.error("Error creating job application:", error);
            setCreateModalOpen(false);
        }
    };

    const deleteApp = (jobId: string) => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
        setCurrentJobDetails(undefined);
    };

    // we're just going to set the isArchived to true and have it update itself. 
    const archiveApp = (jobId: string) => {
        // setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
        // const archivedJob = jobs.find((job) => job.id === jobId);
        // if (archivedJob) {
        //     setArchivedJobs((prevArchived) => [...prevArchived, archivedJob]);
        // }
        // setCurrentJobDetails(undefined);
        console.log("Archiving job with ID:", jobId);
    };

    return (
        <div className="applications">
            <CreateAppModal
                isOpen={createModalOpen}
                handleClose={() => setCreateModalOpen(false)}
                handleCreateApp={createApp}>
            </CreateAppModal>
            <Paper className="job-apps" elevation={24}>
                <AppsToolBar headerTitle={'Your Applications'} handleAddApp={() => setCreateModalOpen(true)}></AppsToolBar>
                <div className="job-apps-content">
                    <JobAppList jobDetailsHandler={handleShowDetails} jobs={jobs} currentJob={currentJobDetails ?? null} />
                    <JobDetails job={currentJobDetails ?? null} onArchive={archiveApp} onDelete={deleteApp} />
                </div>
            </Paper>
        </div>
    );
}

export default Applications;