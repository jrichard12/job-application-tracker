/* eslint-disable @typescript-eslint/no-explicit-any */
import JobAppList from "../../components/JobAppList/JobAppList";
import "./Archives.scss";
import type { JobApp } from "../../types/JobApp";
import { useState, useEffect } from "react";
import JobDetails from "../../components/JobDetails/JobDetails";
import AppsToolBar from "../../components/AppsToolBar/AppsToolBar";
//import jobData from "../../demoData.json";
import { type UserInfo } from "../../types/UserInfo";

interface ArchivesProps {
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}

function Archives({ userInfo, updateUser }: ArchivesProps) {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();
    const [archivedJobs, setArchivedJobs] = useState<JobApp[]>([]);

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
                <AppsToolBar headerTitle={'Archived Applications'}></AppsToolBar>
                <div className="job-apps-content">
                    <JobAppList jobDetailsHandler={handleShowDetails} jobs={archivedJobs} currentJob={currentJobDetails ?? null} />
                    <JobDetails job={currentJobDetails ?? null} userInfo={userInfo ?? null} updateUser={updateUser ?? null} />
                </div>
            </div>
        </div>
    );
}

export default Archives;