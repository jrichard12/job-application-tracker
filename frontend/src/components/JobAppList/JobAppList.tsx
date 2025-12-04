import { Card, CardContent, Chip, List, ListItemButton, Typography } from "@mui/material";
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
                                                <Typography variant="h6" className="job-title" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                                    {job.jobTitle}
                                                </Typography>
                                                <Typography sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                                    {job.company}
                                                </Typography>
                                                <Typography sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                                    {job.location}
                                                </Typography>
                                                {job.jobStatus && (
                                                    <div className="job-status-container">
                                                        <Chip
                                                            label={job.jobStatus}
                                                            size="small"
                                                            className="job-status-chip"
                                                            sx={{
                                                                background: jobStatusColors[job.jobStatus] || '#bdbdbd',
                                                                fontFamily: 'Noto Sans Mono, sans-serif',
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