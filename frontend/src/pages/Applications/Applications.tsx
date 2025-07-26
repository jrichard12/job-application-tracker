/* eslint-disable @typescript-eslint/no-explicit-any */
import JobAppList from "../../components/JobAppList/JobAppList";
import "./Applications.scss";
import type { JobApp } from "../../types/JobApp";
import { useState, useEffect } from "react";
import JobDetails from "../../components/JobDetails/JobDetails";
import AppsToolBar from "../../components/AppsToolBar/AppsToolBar";
import jobData from "../../demoData.json";
import CreateAppModal from "../../components/CreateAppModal/CreateAppModal";


function Applications() {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [jobs, setJobs] = useState<JobApp[]>([]);

    function parseJobApps(data: any[]): JobApp[] {
        return data.map((item) => ({
            ...item,
            dateApplied: item.dateApplied ? new Date(item.dateApplied) : null,
            deadline: item.deadline ? new Date(item.deadline) : null,
            statusUpdated: item.statusUpdated ? new Date(item.statusUpdated) : null,
        }));
    }

    useEffect(() => {
        const loadedJobs: JobApp[] = parseJobApps(jobData);
        setJobs([...loadedJobs]);
    }, []);


    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    };

    const createApp = (jobApp: JobApp | null) => {
        if (jobApp) {
            setJobs((prevJobs) => [...prevJobs, jobApp]);
            setCurrentJobDetails(jobApp);
        }
        setCreateModalOpen(false);
    };

    return (
        <div className="applications">
            <CreateAppModal
                isOpen={createModalOpen}
                handleClose={() => setCreateModalOpen(false)}
                handleCreateApp={createApp}>
            </CreateAppModal>
            <div className="job-apps">
                <AppsToolBar handleAddApp={() => setCreateModalOpen(true)}></AppsToolBar>
                <div className="job-apps-content">
                    <JobAppList jobDetailsHandler={handleShowDetails} jobs={jobs} currentJob={currentJobDetails ?? null} />
                    <JobDetails job={currentJobDetails ?? null} />
                </div>
            </div>
        </div>
    );
}

export default Applications;