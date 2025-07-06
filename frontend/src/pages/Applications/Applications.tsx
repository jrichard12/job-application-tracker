import { Typography } from "@mui/material";
import JobAppList from "../../components/JobAppList/JobAppList";
import "./Applications.scss";
import type { JobApp } from "../../types/JobApp";
import { useState } from "react";
import JobDetails from "../../components/JobDetails/JobDetails";


function Applications() {
    const [currentJobDetails, setCurrentJobDetails] = useState<JobApp>();

    const handleShowDetails = (job: JobApp) => {
        setCurrentJobDetails(job);
    }

    return (
        <div className="applications">
            <div className='page-header'>
                <Typography>
                    Current Job Applications
                </Typography>
            </div>
            <div className="job-apps">
                <div className="job-app-list">
                    <JobAppList jobDetailsHandler={handleShowDetails}>
                    </JobAppList>
                </div>
                <div className="job-app-details">
                    <JobDetails job={currentJobDetails ?? null}>

                    </JobDetails>
                </div>
            </div>
        </div>
    );
}

export default Applications;