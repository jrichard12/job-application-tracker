/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, List, ListItemButton, Typography } from "@mui/material";
import jobData from "../../demoData.json";
import type { JobApp } from "../../types/JobApp";
import { useEffect, useState } from "react";

function JobAppList() {
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

    const showJobDetails = (job: JobApp) => {
        console.log(job.jobTitle);
    };

    return (
        <div className={'job-app-list'}>
            {jobs &&
                <List sx={{ width: "30vw" }}>
                    {
                        jobs.map((job: JobApp) => {
                            return (
                                <ListItemButton onClick={() => showJobDetails(job)}>
                                    <Card sx={{ width: "30vw" }}>
                                        <CardContent>
                                            <Typography>
                                                {job.jobTitle}
                                            </Typography>
                                            <Typography>
                                                {job.location}
                                            </Typography>
                                            <Typography>
                                                {job.salary}
                                            </Typography>
                                        </CardContent>
                                    </Card>
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