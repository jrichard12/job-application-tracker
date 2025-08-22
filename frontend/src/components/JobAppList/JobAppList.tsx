import { Card, CardContent, List, ListItemButton, Typography, Chip } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
import { jobStatusColors } from "../../types/JobApp";
import "./JobAppList.scss";


type JobAppListProps = {
    jobDetailsHandler: (job: JobApp) => void,
    jobs: JobApp[],
    currentJob?: JobApp | null
}

function JobAppList({ jobDetailsHandler, jobs, currentJob }: JobAppListProps) {
    const showJobDetails = (job: JobApp) => {
        jobDetailsHandler(job);
    };

    return (
        <div className={'job-app-list'}>
            {jobs &&
                <List>
                    {
                        jobs.map((job: JobApp, index: number) => {
                            const isActive = job === (typeof currentJob === 'object' && currentJob ? currentJob : undefined);
                            return (
                                <ListItemButton
                                    key={index}
                                    onClick={() => showJobDetails(job)}
                                    disableGutters
                                    className={`job-app-list-item ${isActive ? 'active-job-app' : ''}`}
                                >
                                    <div className="job-app-list-item-content">
                                        {isActive && <div className="job-app-active-indicator left" />}
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" className="job-title">
                                                    {job.jobTitle}
                                                </Typography>
                                                <Typography>
                                                    {job.location}
                                                </Typography>
                                                <Typography>
                                                    {job.salary}
                                                </Typography>
                                                {job.jobStatus && (
                                                    <div className="job-status-container">
                                                        <Chip
                                                            label={job.jobStatus}
                                                            size="small"
                                                            className="job-status-chip"
                                                            sx={{
                                                                background: jobStatusColors[job.jobStatus] || '#bdbdbd',
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </ListItemButton>
                            )
                        })
                    }
                </List>
            }
        </div>
    );
}

export default JobAppList;