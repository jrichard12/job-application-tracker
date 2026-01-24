/* eslint-disable @typescript-eslint/no-explicit-any */

import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TableSortLabel } from "@mui/material";
import type { JobApp } from "../../types/JobApp";
import { jobStatusColors } from "../../types/JobApp";
import { truncateUrl } from "../../utils/urlUtils";
import "./JobAppsListView.scss";
import { useState } from "react";


type JobAppsListViewProps = {
    jobs: JobApp[];
};


function JobAppsListView({ jobs }: JobAppsListViewProps) {
    const [sortBy, setSortBy] = useState<string>('dateApplied');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const formatDate = (date: Date | string | null | undefined) => {
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

    // Sorting logic
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const getComparator = (column: string) => {
        return (a: JobApp, b: JobApp) => {
            let aValue: any = a[column as keyof JobApp];
            let bValue: any = b[column as keyof JobApp];

            // Special handling for some columns
            if (column === 'dateApplied') {
                aValue = aValue ? new Date(aValue) : new Date(0);
                bValue = bValue ? new Date(bValue) : new Date(0);
            } else if (column === 'salary') {
                // Try to parse as number, fallback to string
                const parseSalary = (val: any) => {
                    if (!val) return 0;
                    const num = parseFloat(val.toString().replace(/[^\d.]/g, ''));
                    return isNaN(num) ? 0 : num;
                };
                aValue = parseSalary(aValue);
                bValue = parseSalary(bValue);
            } else if (column === 'jobStatus') {
                // Sort by status order
                const statusOrder = [
                    'Interested', 'Applied', 'Interviewed', 'Offered', 'Accepted', 'Rejected'
                ];
                aValue = statusOrder.indexOf(aValue);
                bValue = statusOrder.indexOf(bValue);
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        };
    };

    const sortedJobs = [...jobs].sort(getComparator(sortBy));

    return (
        <div className="job-apps-list-view">
            <TableContainer component={Paper} className="job-apps-table-container">
                <Table className="job-apps-table" stickyHeader>
                    <TableHead>
                        <TableRow className="job-apps-table-header">
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'jobTitle' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'jobTitle'}
                                    direction={sortBy === 'jobTitle' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('jobTitle')}
                                >
                                    Job Title
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'company' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'company'}
                                    direction={sortBy === 'company' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('company')}
                                >
                                    Company
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'location' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'location'}
                                    direction={sortBy === 'location' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('location')}
                                >
                                    Location
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'salary' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'salary'}
                                    direction={sortBy === 'salary' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('salary')}
                                >
                                    Salary
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'dateApplied' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'dateApplied'}
                                    direction={sortBy === 'dateApplied' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('dateApplied')}
                                >
                                    Date Applied
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'response' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'response'}
                                    direction={sortBy === 'response' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('response')}
                                >
                                    Response
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'jobStatus' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'jobStatus'}
                                    direction={sortBy === 'jobStatus' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('jobStatus')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className="table-header-cell" sortDirection={sortBy === 'source' ? sortDirection : false}>
                                <TableSortLabel
                                    active={sortBy === 'source'}
                                    direction={sortBy === 'source' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('source')}
                                >
                                    Source
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="empty-state-cell">
                                    <Typography className="empty-state-message" sx={{ fontFamily: 'Noto Sans Mono, sans-serif' }}>
                                        No job applications found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedJobs.map((job, index) => (
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
