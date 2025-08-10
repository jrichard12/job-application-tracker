/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AppsToolBar from "../../components/AppsToolBar/AppsToolBar";
import JobAppList from "../../components/JobAppList/JobAppList";
import JobDetails from "../../components/JobDetails/JobDetails";
import type { JobApp } from "../../types/JobApp";
import "./Applications.scss";
//import jobData from "../../demoData.json";
import { Paper } from "@mui/material";
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
            //const newJob = JSON.parse(data);
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
                <AppsToolBar headerTitle={'Your Applications'} handleAddApp={() => setCreateModalOpen(true)}></AppsToolBar>
                <div className="job-apps-content">
                    <JobAppList jobDetailsHandler={handleShowDetails} jobs={jobs} currentJob={currentJobDetails ?? null} />
                    <JobDetails job={currentJobDetails ?? null}     userInfo={userInfo ?? null} updateUser={updateUser ?? null} />;
                </div>
            </Paper>
        </div>
    );
}

export default Applications;