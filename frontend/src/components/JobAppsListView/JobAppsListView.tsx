import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
import { jobStatusColors } from "../../types/JobApp";
import { truncateUrl } from "../../utils/urlUtils";
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

    const hasResponse = (status: string) => {
        return status !== 'Applied' && status !== 'Interested';
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
                            <TableCell className="table-header-cell">Date Applied</TableCell>
                            <TableCell className="table-header-cell">Response</TableCell>
                            <TableCell className="table-header-cell">Status</TableCell>
                            <TableCell className="table-header-cell">Source</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="empty-state-cell">
                                    <Typography className="empty-state-message" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                        No job applications found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job, index) => (
                                <TableRow key={job.id || index} className="job-app-table-row">
                                    <TableCell className="table-cell job-title-cell">
                                        <Typography className="job-title-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                            {job.jobTitle}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="company-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                            {job.company}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="location-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                            {job.location || "N/A"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="salary-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                            {formatSalary(job.salary)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        <Typography className="date-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                            {formatDate(job.dateApplied)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className="table-cell response-cell">
                                        <Typography 
                                            className="response-indicator" 
                                            sx={{ 
                                                fontFamily: 'Noto Sans Mono, sans-serif',
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                color: hasResponse(job.jobStatus) ? '#27ae60' : '#e74c3c',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {hasResponse(job.jobStatus) ? '✓' : '✗'}
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
                                                minWidth: '80px',
                                                fontFamily: 'Noto Sans Mono, sans-serif',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="table-cell">
                                        {job.source && (job.source.startsWith('http://') || job.source.startsWith('https://')) ? (
                                            <Typography 
                                                component="a" 
                                                href={job.source} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="source-link"
                                                sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}
                                                title={job.source}
                                            >
                                                {truncateUrl(job.source, 40)}
                                            </Typography>
                                        ) : (
                                            <Typography className="source-text" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                                {job.source}
                                            </Typography>
                                        )}
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
