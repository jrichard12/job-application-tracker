import { Card, CardContent, List, ListItemButton, Typography } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
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
                <List sx={{ paddingTop: 0, width: '100%', alignItems: 'flex-start' }}>
                    {
                        jobs.map((job: JobApp, index: number) => {
                            const isActive = job === (typeof currentJob === 'object' && currentJob ? currentJob : undefined);
                            return (
                                <ListItemButton
                                    key={index}
                                    onClick={() => showJobDetails(job)}
                                    disableGutters
                                    sx={{
                                        margin: '0 0 0.4rem 0',
                                        padding: 0,
                                        '&:last-child': { marginBottom: 0 },
                                        position: 'relative',
                                        background: isActive ? 'rgba(32, 165, 166, 0.07)' : 'none',
                                        minHeight: 0,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        width: 'auto',
                                        display: 'block',
                                    }}
                                    className={isActive ? 'active-job-app' : ''}
                                >
                                    <div className="job-app-list-item-content" style={{ position: 'relative', width: '100%' }}>
                                        {isActive && <div className="job-app-active-indicator left" style={{ position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 2 }} />}
                                        <Card sx={{ width: '100%', boxShadow: 'none', position: 'relative' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontFamily={"var(--font-family)"}>
                                                    {job.jobTitle}
                                                </Typography>
                                                <Typography>
                                                    {job.location}
                                                </Typography>
                                                <Typography>
                                                    {job.salary}
                                                </Typography>
                                                {job.status && (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                                        <Chip
                                                            label={job.status}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 500,
                                                                background: statusColors[job.status] || '#bdbdbd',
                                                                color: '#fff',
                                                                minWidth: 56,
                                                                height: 22,
                                                                px: 1,
                                                                fontSize: '0.80rem',
                                                                letterSpacing: 0.1,
                                                                boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)',
                                                                whiteSpace: 'nowrap',
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


import { Chip } from "@mui/material";
const statusColors: Record<string, string> = {
    Interested: '#bdbdbd',
    Applied: '#20a5a6',
    Interviewed: '#1976d2',
    Offered: '#ff9800',
    Accepted: '#388e3c',
    Rejected: '#d32f2f',
};

export default JobAppList;