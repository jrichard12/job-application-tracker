import { Typography } from "@mui/material";
import JobAppList from "../../components/JobAppList/JobAppList";
import "./Applications.scss";


function Applications() {
    return (
        <div className="applications">
            <div className='page-header'>
                <Typography>
                    Current Job Applications
                </Typography>
            </div>
            <div className="job-apps">
                <div className="job-app-list">
                    <JobAppList>
                    </JobAppList>
                </div>
                <div className="job-app-details">
                    
                </div>
            </div>
        </div>
    );
}

export default Applications;