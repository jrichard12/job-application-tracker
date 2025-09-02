import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Tooltip, Typography } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../services/authService";
import type { JobApp } from "../../types/JobApp";
import { jobAppStatusOptions, jobStatusColors } from "../../types/JobApp";
import type { UserInfo } from "../../types/UserInfo";
import SnackbarAlert from '../SnackbarAlert/SnackbarAlert';
import "./JobDetails.scss";

type JobDetailsProps = {
    job: JobApp | null,
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function JobDetails({ job, updateUser, userInfo }: JobDetailsProps) {
    // Editing states
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempFieldValue, setTempFieldValue] = useState<string>("");
    const [editingSkills, setEditingSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [tempSkills, setTempSkills] = useState<string[]>([]);
    const [editingDescription, setEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState<string>("");
    const [editingDeadline, setEditingDeadline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

    const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
    
    // Helper function to safely parse dates
    const parseDate = (dateValue: string | Date | null | undefined): Date | null => {
        if (!dateValue) return null;
        
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue;
        }
        
        if (typeof dateValue === 'string') {
            // Handle ISO strings and date-only strings
            const date = dateValue.includes('T') ? new Date(dateValue) : new Date(dateValue + 'T12:00:00');
            return isNaN(date.getTime()) ? null : date;
        }
        
        return null;
    };
    
    const [currentJob, setCurrentJob] = useState<JobApp | null>(job ? {
        ...job,
        deadline: parseDate(job.deadline),
        lastUpdated: parseDate(job.lastUpdated),
    } : null);

    const { demoMode, user } = useAuth();
    const jobHandlerUrl = import.meta.env.VITE_JOB_HANDLER_URL;

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setSnackbar({ open: true, message, severity });
    }

    const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    }

    // Editing description
    useEffect(() => {
        setEditingDescription(false);
        setTempDescription("");
        setCurrentJob(job ? {
            ...job,
            deadline: parseDate(job.deadline),
            lastUpdated: parseDate(job.lastUpdated),
        } : null);
        setEditingDeadline(false);
    }, [job])

    // Revert description if not saved
    useEffect(() => {
        if (!editingDescription && tempDescription !== "" && currentJob && tempDescription !== currentJob.description) {
            setTempDescription("");
        }
    }, [editingDescription, currentJob, tempDescription]);

    // Click outside to cancel editing
    useEffect(() => {
        if (!editingField) return;
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (!target.closest('.job-details-value')) {
                setEditingField(null);
                setTempFieldValue("");
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [editingField]);

    const handleSave = useCallback(async (jobToSave?: JobApp | null) => {
        const job = jobToSave ?? currentJob;
        if (!job) {
            showSnackbar('No job data to save', 'error');
            return false;
        }

        if (!user?.authToken) {
            showSnackbar('Authentication required to save job', 'error');
            return false;
        }

        setLoading(true);

        // Just updating local state for demo users
        if (demoMode) {
            // Add a small delay to show the spinner for demo mode
            await new Promise(resolve => setTimeout(resolve, 500));
            if (updateUser && userInfo) {
                updateUser({ ...userInfo, jobApps: userInfo.jobApps?.map(app => app.id === job.id ? { ...job } : app) });
            }
            showSnackbar('Job saved', 'success');
            setLoading(false);
            return true;
        }

        if (!job.PK || !job.SK) {
            showSnackbar('Job is missing required identifiers (PK/SK)', 'error');
            setLoading(false);
            return false;
        }
        
        console.log("Saving job:", job);

        // Format the job data for the API, ensuring dates are in ISO string format
        const jobDataForAPI = {
            ...job,
            deadline: job.deadline instanceof Date ? job.deadline.toISOString() : job.deadline,
            lastUpdated: new Date().toISOString() // Always update the lastUpdated timestamp
        };

        try {
            const response = await fetch(jobHandlerUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.authToken}`
                },
                body: JSON.stringify(jobDataForAPI),
            });
            const result = await response.json();
            console.log('Update result:', result);
            if (response.ok) {
                const updatedJob = { ...job, lastUpdated: new Date() };
                if (updateUser && userInfo) {
                    updateUser({ ...userInfo, jobApps: userInfo.jobApps?.map(app => app.id === job.id ? updatedJob : app) });
                }
                setCurrentJob(updatedJob);
                showSnackbar('Job saved', 'success');
                setLoading(false);
                return true;
            } else {
                showSnackbar('Failed to save job', 'error');
                setLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Error updating job:', error);
            showSnackbar('Error updating job', 'error');
            setLoading(false);
            return false;
        }
    }, [currentJob, demoMode, updateUser, userInfo, jobHandlerUrl, user?.authToken]);

    const handleArchive = async () => {
        if (!currentJob) {
            showSnackbar('No job selected to archive', 'error');
            return;
        }

        if (!user?.authToken) {
            showSnackbar('Authentication required to archive job', 'error');
            return;
        }

        setLoading(true);
        
        if (demoMode) {
            // Add a small delay to show the spinner for demo mode
            await new Promise(resolve => setTimeout(resolve, 500));
            const updatedJob = { ...currentJob, isArchived: true };
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps?.map(app => app.id === updatedJob.id ? updatedJob : app) || []]
            } as UserInfo);
            setCurrentJob(null);
            showSnackbar('Job archived', 'success');
            setLoading(false);
            return;
        }
        
        const updatedJob = { ...currentJob, isArchived: true };
        console.log("Archiving job:", updatedJob);
        
        if (!updatedJob.PK || !updatedJob.SK) {
            showSnackbar('Job is missing required identifiers (PK/SK)', 'error');
            setLoading(false);
            return;
        }
        const ok = await handleSave(updatedJob);
        if (ok) {
            setCurrentJob(null);
            showSnackbar('Job archived', 'success');
        } else {
            showSnackbar('Failed to archive job', 'error');
        }
        setLoading(false);
    }

    const handleDelete = async () => {
        if (!currentJob) {
            showSnackbar('No job selected to delete', 'error');
            return;
        }

        if (!user?.authToken) {
            showSnackbar('Authentication required to delete job', 'error');
            return;
        }

        setLoading(true);
        
        if (demoMode) {
            // Add a small delay to show the spinner for demo mode
            await new Promise(resolve => setTimeout(resolve, 500));
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps?.filter(app => app.id !== currentJob.id) || []]
            } as UserInfo);
            setCurrentJob(null);
            showSnackbar('Job deleted', 'success');
            setLoading(false);
            return;
        }
        
        console.log("Attempting to delete job with PK:", currentJob.PK, "and SK:", currentJob.SK);
        if (!currentJob.PK || !currentJob.SK) {
            console.error("Cannot delete job: Missing PK or SK.");
            showSnackbar('Job is missing required identifiers (PK/SK)', 'error');
            setLoading(false);
            return;
        }

        try {
            const url = `${jobHandlerUrl}?PK=${encodeURIComponent(currentJob.PK)}&SK=${encodeURIComponent(currentJob.SK)}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.authToken}`
                }
            });
            const result = await response.json();
            console.log('Delete result:', result);
            if (response.ok) {
                if (updateUser && userInfo) {
                    updateUser({
                        ...userInfo,
                        jobApps: userInfo.jobApps?.filter(app => app.id !== currentJob.id) ?? []
                    });
                }
                setCurrentJob(null);
                showSnackbar('Job deleted', 'success');
            } else {
                showSnackbar('Failed to delete job', 'error');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            showSnackbar('Error deleting job', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="job-details-card">
            {loading && (
                <div className="job-details-loading-overlay">
                    <div className="loading-box">
                        <CircularProgress color="primary" />
                        <Typography variant="h6" component="div" className="loading-text">
                            Processing...
                        </Typography>
                    </div>
                </div>
            )}
            <CardContent className="job-details-card-content">
                {currentJob &&
                    <div className="job-card">
                        <div className="job-card-content">
                            <div className="job-details-header">
                                <div className="job-details-title-row">
                                    <Typography variant="h4" className="job-details-title">
                                        {currentJob.jobTitle}
                                    </Typography>
                                </div>
                                <div className="job-details-info-row">
                                    <Tooltip title={currentJob.isArchived ? "" : "Click to edit deadline"} arrow>
                                        <span className="job-details-deadline"
                                            onClick={currentJob.isArchived ? undefined : () => setEditingDeadline(true)}
                                        >
                                            Deadline: {editingDeadline ? (
                                                <input
                                                    type="date"
                                                    value={currentJob.deadline && !isNaN(currentJob.deadline.getTime()) ? currentJob.deadline.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => {
                                                        // Create a Date object at noon local time to avoid timezone issues
                                                        const date = parseDate(e.target.value);
                                                        setCurrentJob({ ...currentJob, deadline: date });
                                                        setEditingDeadline(false);
                                                    }}
                                                    onBlur={() => setEditingDeadline(false)}
                                                    autoFocus
                                                    style={{
                                                        fontSize: '0.98rem',
                                                        color: '#201335',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '2px 6px',
                                                        background: 'white'
                                                    }}
                                                />
                                            ) : (
                                                currentJob.deadline && !isNaN(currentJob.deadline.getTime()) ? currentJob.deadline.toLocaleDateString() : 'No deadline set'
                                            )}
                                        </span>
                                    </Tooltip>
                                    <span className="job-details-status-container">
                                        <div className="job-details-status-wrapper">
                                            <Chip
                                                label={currentJob.jobStatus ? currentJob.jobStatus : "Interested"}
                                                size="small"
                                                className="job-details-status-chip"
                                                sx={{
                                                    backgroundColor: currentJob.jobStatus ? jobStatusColors[currentJob.jobStatus] : '#e0f7fa',
                                                    color: '#fff',
                                                    fontWeight: 500,
                                                    minWidth: '120px',
                                                    paddingRight: '28px'
                                                }}
                                                onClick={currentJob.isArchived ? undefined : (e) => setStatusMenuAnchor(e.currentTarget)}
                                            />
                                            {!currentJob.isArchived &&
                                                <ArrowDropDownIcon className="job-details-status-dropdown" />
                                            }
                                        </div>
                                        <Menu
                                            anchorEl={statusMenuAnchor}
                                            open={Boolean(statusMenuAnchor)}
                                            onClose={() => setStatusMenuAnchor(null)}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                            disableScrollLock={true}
                                            slotProps={{ list: { sx: { minWidth: 120, padding: 0 } } }}
                                        >
                                            {jobAppStatusOptions.map((option) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={option === currentJob.jobStatus}
                                                    onClick={() => {
                                                        setCurrentJob({ ...currentJob, jobStatus: option });
                                                        setStatusMenuAnchor(null);
                                                    }}
                                                    className="job-details-menu-item"
                                                    sx={{
                                                        fontWeight: 500,
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5'
                                                        },
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#e3f2fd',
                                                            '&:hover': {
                                                                backgroundColor: '#e3f2fd'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </span>
                                    <span className="job-details-last-updated">
                                        Last Updated: {currentJob.lastUpdated && !isNaN(currentJob.lastUpdated.getTime()) ? currentJob.lastUpdated.toLocaleDateString() : 'No date provided'}
                                    </span>
                                </div>
                            </div>
                            <Divider variant="middle" flexItem />
                            <div className="job-details-row">
                                <span className="job-details-label">Company:</span>
                                <span className="job-details-value">
                                    {editingField === 'company' ? (
                                        <>
                                            <input
                                                type="text"
                                                value={tempFieldValue}
                                                autoFocus
                                                onChange={e => setTempFieldValue(e.target.value)}
                                                className="job-details-edit-input"
                                            />
                                            <IconButton size="small" className="job-details-save-button" aria-label="Save company" onClick={() => { setCurrentJob({ ...currentJob, company: tempFieldValue }); setEditingField(null); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </IconButton>
                                            <IconButton size="small" className="job-details-cancel-button" aria-label="Cancel company" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </IconButton>
                                        </>
                                    ) : (
                                        <div className="job-details-field-container">
                                            <span className="job-details-field-text">{currentJob.company || 'No company provided'}</span>
                                            {!currentJob.isArchived &&
                                                <div className="job-details-edit-controls">
                                                    <IconButton size="small" className="job-details-icon-button--edit" aria-label="Edit company" onClick={() => { setEditingField('company'); setTempFieldValue(currentJob.company || ""); }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            }
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className="job-details-row">
                                <span className="job-details-label">Source:</span>
                                <span className="job-details-value">
                                    {editingField === 'source' ? (
                                        <>
                                            <input
                                                type="text"
                                                value={tempFieldValue}
                                                autoFocus
                                                onChange={e => setTempFieldValue(e.target.value)}
                                                className="job-details-edit-input"
                                            />
                                            <IconButton size="small" className="job-details-save-button" aria-label="Save source" onClick={() => { setCurrentJob({ ...currentJob, source: tempFieldValue }); setEditingField(null); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </IconButton>
                                            <IconButton size="small" className="job-details-cancel-button" aria-label="Cancel source" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </IconButton>
                                        </>
                                    ) : (
                                        <div className="job-details-field-container">
                                            {currentJob.source && (currentJob.source.startsWith('http://') || currentJob.source.startsWith('https://')) ? (
                                                <Typography 
                                                    component="a" 
                                                    href={currentJob.source} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="job-details-source-link"
                                                >
                                                    {currentJob.source}
                                                </Typography>
                                            ) : (
                                                <span className="job-details-field-text">{currentJob.source || 'No source provided'}</span>
                                            )}
                                            {!currentJob.isArchived &&
                                                <div className="job-details-edit-controls">
                                                    <IconButton size="small" className="job-details-icon-button--edit" aria-label="Edit source" onClick={() => { setEditingField('source'); setTempFieldValue(currentJob.source || ""); }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            }
                                        </div>
                                    )}
                                </span>
                            </div>
                            <div className="job-details-row">
                                <span className="job-details-label">Location:</span>
                                <span className="job-details-value">
                                    {editingField === 'location' ? (
                                        <>
                                            <input
                                                type="text"
                                                value={tempFieldValue}
                                                autoFocus
                                                className="job-details-input"
                                                onChange={e => setTempFieldValue(e.target.value)}
                                            />
                                            <IconButton size="small" className="job-details-icon-button--save" aria-label="Save location" onClick={() => { setCurrentJob({ ...currentJob, location: tempFieldValue }); setEditingField(null); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </IconButton>
                                            <IconButton size="small" className="job-details-icon-button--cancel" aria-label="Cancel location" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <span className="job-details-field-content">{currentJob.location || 'No location provided'}</span>
                                            {!currentJob.isArchived &&
                                                <div className="job-details-edit-container">
                                                    <IconButton size="small" className="job-details-icon-button--edit" aria-label="Edit location" onClick={() => { setEditingField('location'); setTempFieldValue(currentJob.location || ""); }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            }
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="job-details-row">
                                <span className="job-details-label">Salary:</span>
                                <span className="job-details-value">
                                    {editingField === 'salary' ? (
                                        <>
                                            <input
                                                type="text"
                                                value={tempFieldValue}
                                                autoFocus
                                                className="job-details-input"
                                                onChange={e => setTempFieldValue(e.target.value)}
                                            />
                                            <IconButton size="small" className="job-details-icon-button--save" aria-label="Save salary" onClick={() => { setCurrentJob({ ...currentJob, salary: tempFieldValue }); setEditingField(null); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </IconButton>
                                            <IconButton size="small" className="job-details-icon-button--cancel" aria-label="Cancel salary" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <span className="job-details-field-content">{currentJob.salary || 'No salary provided'}</span>
                                            {!currentJob.isArchived &&
                                                <div className="job-details-edit-container">
                                                    <IconButton size="small" className="job-details-icon-button--edit" aria-label="Edit salary" onClick={() => { setEditingField('salary'); setTempFieldValue(currentJob.salary || ""); }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            }
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className={`job-details-row job-details-row--skills ${editingSkills ? 'editing' : ''}`}>
                                <span className={`job-details-label job-details-label--skills ${editingSkills ? 'editing' : ''}`}>Skills:</span>
                                <span className={`job-details-value job-details-value--skills ${editingSkills ? 'editing' : ''}`}>
                                    {editingSkills ? (
                                        <div className="skills-editing-container">
                                            <div className="skills-input-container">
                                                <input
                                                    type="text"
                                                    value={newSkill}
                                                    autoFocus
                                                    placeholder="Add a skill"
                                                    className="skills-input"
                                                    onChange={e => setNewSkill(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && newSkill.trim()) {
                                                            if (!tempSkills.includes(newSkill.trim())) {
                                                                const updatedSkills = [...tempSkills, newSkill.trim()];
                                                                setTempSkills(updatedSkills);
                                                                setCurrentJob({
                                                                    ...currentJob,
                                                                    skills: updatedSkills
                                                                });
                                                            }
                                                            setNewSkill("");
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setEditingSkills(false);
                                                            setTempSkills(currentJob.skills || []);
                                                            setNewSkill("");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="skills-hint">
                                                Press Enter to add • Press Escape to finish editing
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className={`skills-chips-container ${editingSkills ? 'editing' : ''}`}>
                                        {(!editingSkills && (!currentJob.skills || currentJob.skills.length === 0)) ? (
                                            <span className="skills-no-content">No skills listed</span>
                                        ) : (
                                            (editingSkills ? tempSkills : currentJob.skills)?.map((skill: string, idx: number) => (
                                                <Chip
                                                    key={idx}
                                                    label={skill}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500,
                                                        background: '#42047e',
                                                        color: '#fff',
                                                        margin: 0,
                                                        '& .MuiChip-deleteIcon': {
                                                            color: '#ff4444',
                                                            '&:hover': {
                                                                color: '#ff0000'
                                                            }
                                                        }
                                                    }}
                                                    onDelete={editingSkills ? () => {
                                                        const updatedSkills = tempSkills.filter((s: string) => s !== skill);
                                                        setTempSkills(updatedSkills);
                                                        setCurrentJob({
                                                            ...currentJob,
                                                            skills: updatedSkills
                                                        });
                                                    } : undefined}
                                                />
                                            ))
                                        )}
                                    </div>
                                    {!editingSkills && !currentJob.isArchived && (
                                        <div className="job-details-edit-container--skills">
                                            <IconButton size="small" className="job-details-icon-button--edit" aria-label="Edit skills" onClick={() => {
                                                setEditingSkills(true);
                                                setTempSkills(currentJob.skills || []);
                                            }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    )}
                                </span>
                            </div>

                            <div className={`job-details-description job-details-description-section ${editingDescription ? 'editing' : ''}`}>
                                {currentJob.description && !editingDescription && (
                                    <Tooltip title="View description in modal" arrow>
                                        <IconButton
                                            size="small"
                                            className="description-view-button"
                                            onClick={() => setDescriptionModalOpen(true)}
                                        >
                                            <OpenInFullIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {editingDescription ? (
                                    <textarea
                                        value={tempDescription}
                                        onChange={e => setTempDescription(e.target.value)}
                                        autoFocus
                                        placeholder="Enter job description..."
                                    />
                                ) : (
                                    <div className="job-details-description-text">
                                        {currentJob.description ? currentJob.description : <span style={{ color: '#6c757d' }}>No description provided</span>}
                                    </div>
                                )}
                                {!currentJob.isArchived && (
                                    <IconButton
                                        size="small"
                                        className="description-action-button"
                                        onClick={() => {
                                            if (editingDescription) {
                                                setCurrentJob({ ...currentJob, description: tempDescription });
                                                setEditingDescription(false);
                                            } else {
                                                setTempDescription(currentJob.description || "");
                                                setEditingDescription(true);
                                            }
                                        }}
                                    >
                                        {editingDescription ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                                    </IconButton>
                                )}
                            </div>
                        </div>

                        <div className="job-card-actions">
                            {!currentJob.isArchived && (
                                <>
                                    <button
                                        type="button"
                                        className="archive-button"
                                        onClick={() => {
                                            if (currentJob) {
                                                handleArchive();
                                            }
                                        }}
                                        disabled={loading}
                                    >Archive</button>
                                    <button
                                        type="button"
                                        className="save-button"
                                        onClick={() => {
                                            if (currentJob) {
                                                handleSave();
                                            }
                                        }}
                                        disabled={loading}
                                    >Save</button>
                                </>
                            )}
                            {currentJob.isArchived && (
                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >Delete</button>
                            )}
                        </div>
                    </div>
                }
                {!currentJob &&
                    "No job selected."
                }
                <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
            </CardContent>

            {/* Description Modal */}
            <Dialog
                open={descriptionModalOpen}
                onClose={() => {
                    setDescriptionModalOpen(false);
                    setEditingDescription(false);
                    setTempDescription("");
                }}
                maxWidth="md"
                fullWidth
                className="job-description-modal"
                slotProps={{
                    paper: {
                        className: "job-description-modal-paper"
                    }
                }}
            >
                <DialogTitle className="job-description-modal-title">
                    Job Description - {currentJob?.jobTitle}
                    <IconButton
                        onClick={() => {
                            setDescriptionModalOpen(false);
                            setEditingDescription(false);
                            setTempDescription("");
                        }}
                        className="job-description-modal-close-button"
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent className="job-description-modal-content">
                    {editingDescription ? (
                        <textarea
                            value={tempDescription}
                            onChange={(e) => setTempDescription(e.target.value)}
                            autoFocus
                            placeholder="Enter job description..."
                            className="job-description-modal-textarea"
                        />
                    ) : (
                        <div className="job-description-modal-viewer">
                            {currentJob?.description || 'No description provided'}
                        </div>
                    )}
                    {!currentJob?.isArchived && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                if (editingDescription) {
                                    if (currentJob) {
                                        setCurrentJob({ ...currentJob, description: tempDescription });
                                    }
                                    setEditingDescription(false);
                                } else {
                                    setTempDescription(currentJob?.description || "");
                                    setEditingDescription(true);
                                }
                            }}
                            className="job-description-modal-edit-button"
                        >
                            {editingDescription ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                        </IconButton>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default JobDetails;