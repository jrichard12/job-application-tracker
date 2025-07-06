/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Chip, Divider, Typography } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
import { useState, useEffect } from "react";

type JobDetailsProps = {
    job: JobApp | null
}

function JobDetails({ job }: JobDetailsProps) {
    const [currentJob, setCurrentJob] = useState<JobApp | null>(job);

    useEffect(() => {
        setCurrentJob(job);
    }, [job])

    return (
        <div className={'job-details'}>
            <Card>
                <CardContent>
                    {currentJob &&
                        <div className="job-card">
                            <Typography variant="h4">
                                {currentJob.jobTitle}
                            </Typography>
                            <Divider variant="middle" flexItem />
                            <Typography variant="body1" textAlign={'left'}>
                                {`Job Posting Source: ${currentJob.source}`}
                            </Typography>
                            <Typography variant="body1" textAlign={'left'}>
                                {`Location: ${currentJob.location}`}
                            </Typography>
                            <Typography variant="body1" textAlign={'left'}>
                                {`Salary: ${currentJob.salary}`}
                            </Typography>
                            <Typography variant="body1" textAlign={'left'}>
                                {`Description: ${currentJob.description}`}
                            </Typography>
                            <Chip label={currentJob.status ? currentJob.status : "Draft"}></Chip>
                        </div>
                    }
                    {!currentJob &&
                        "No job selected."
                    }
                </CardContent>
            </Card>
        </div>
    );
}

export default JobDetails;