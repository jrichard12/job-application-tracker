import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
import { jobStatusColors } from "../../types/JobApp";
import "./JobAppsListView.scss";

type JobAppsListViewProps = {
    jobs: JobApp[];
}

function JobAppsListView({ jobs }: JobAppsListViewProps) {
    const formatDate = (date: Date | null | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString();
    };

    const formatSalary = (salary: string | undefined) => {
        if (!salary) return "N/A";
        return salary;
    };

    return (
        <div className="job-apps-list-view">
            <TableContainer component={Paper} className="job-apps-table-container">
                <Table className="job-apps-table" stickyHeader>
                    <TableHead>
                        <TableRow className="job-apps-table-header">
                            <TableCell className="table-header-cell">Job Title</TableCell>
                            <TableCell className="table-header-cell">Company</TableCell>
                            <TableCell className="table-header-cell">Location</TableCell>
                            <TableCell className="table-header-cell">Salary</TableCell>
                            <TableCell className="table-header-cell">Status</TableCell>
                            <TableCell className="table-header-cell">Date Applied</TableCell>
                            <TableCell className="table-header-cell">Deadline</TableCell>
                            <TableCell className="table-header-cell">Last Updated</TableCell>
                            <TableCell className="table-header-cell">Source</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="empty-state-cell">
                                    <Typography className="empty-state-message">
                                        No job applications found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job, index) => (
                                <TableRow key={job.id || index} className="job-app-table-row">
                                    <TableCell className="table-cell job-title-cell">
                                        <Typography className="job-title-text">
                                            {job.jobTitle}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="company-text">
                                            {job.company}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="location-text">
                                            {job.location || "N/A"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="salary-text">
                                            {formatSalary(job.salary)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Chip
                                            label={job.jobStatus}
                                            size="small"
                                            className="status-chip"
                                            sx={{
                                                backgroundColor: jobStatusColors[job.jobStatus] || '#bdbdbd',
                                                color: '#fff',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                minWidth: '80px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="date-text">
                                            {formatDate(job.dateApplied)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="deadline-text">
                                            {formatDate(job.deadline)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="date-text">
                                            {formatDate(job.lastUpdated)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="source-text">
                                            {job.source}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default JobAppsListView;
