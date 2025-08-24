import { Card, CardContent, Chip, Divider, Typography } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import "./JobDetails.scss";
import type { JobApp } from "../../types/JobApp";
import { jobAppStatusOptions, jobStatusColors } from "../../types/JobApp";
import { useState, useEffect, useCallback } from "react";
import type { UserInfo } from "../../types/UserInfo";
import { useAuth } from "../../services/authService";

type JobDetailsProps = {
    job: JobApp | null,
    userInfo: UserInfo | null;
    updateUser: (newInfo: UserInfo | null) => void;
}


function JobDetails({ job, updateUser, userInfo }: JobDetailsProps) {
    // Inline editing state for fields
    useEffect(() => {
        console.log('JobDetails initial job prop:', job);
    }, [job]);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempFieldValue, setTempFieldValue] = useState<string>("");
    // Skills editing state
    const [editingSkills, setEditingSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [tempSkills, setTempSkills] = useState<string[]>([]);
    const { demoMode, user } = useAuth();
    const jobHandlerUrl = import.meta.env.VITE_JOB_HANDLER_URL;
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
    const [editingDescription, setEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState<string>("");
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
    // Store dates as Date objects in state for compatibility with MUI DatePicker
    const [currentJob, setCurrentJob] = useState<JobApp | null>(job ? {
        ...job,
        deadline: job?.deadline ? new Date(job.deadline) : null,
        lastUpdated: job?.lastUpdated ? new Date(job.lastUpdated) : null,
    } : null);
    const [editingDeadline, setEditingDeadline] = useState(false);

    useEffect(() => {
        setEditingDescription(false);
        setTempDescription("");
        setCurrentJob(job ? {
            ...job,
            deadline: job?.deadline ? new Date(job.deadline) : null,
            lastUpdated: job?.lastUpdated ? new Date(job.lastUpdated) : null,
        } : null);
        setEditingDeadline(false);
    }, [job])

    // Revert description if not saved
    useEffect(() => {
        if (!editingDescription && tempDescription !== "" && currentJob && tempDescription !== currentJob.description) {
            setTempDescription("");
        }
    }, [editingDescription, currentJob, tempDescription]);

    const handleSave = useCallback(async (jobToSave?: JobApp | null) => {
        const job = jobToSave ?? currentJob;
        if (!job) return;
        
        if (demoMode) {
            // For demo mode, just update the local state
            if (updateUser && userInfo) {
                updateUser({ ...userInfo, jobApps: userInfo.jobApps?.map(app => app.id === job.id ? { ...job } : app) });
            }
            return;
        }
        
        if (!job.PK || !job.SK) return;
        console.log("Saving job:", job);

        try {
            const response = await fetch(jobHandlerUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.authToken}`
                },
                body: JSON.stringify(job),
            });
            const result = await response.json();
            console.log('Update result:', result);
            if (updateUser && userInfo) {
                updateUser({ ...userInfo, jobApps: userInfo.jobApps?.map(app => app.id === job.id ? { ...job } : app) });
            }
        } catch (error) {
            console.error('Error updating job:', error);
        }
    }, [currentJob, demoMode, updateUser, userInfo, jobHandlerUrl, user?.authToken]);

    const handleArchive = async () => {
        if (!currentJob) return;
        if (demoMode) {
            const updatedJob = { ...currentJob, isArchived: true };
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps?.map(app => app.id === updatedJob.id ? updatedJob : app) || []]
            } as UserInfo);
            setCurrentJob(null);
            return;
        }
        console.log("currentJob before archiving:", currentJob);
        const updatedJob = { ...currentJob, isArchived: true };
        console.log("Archiving job:", updatedJob);
        if (!updatedJob.PK || !updatedJob.SK) return;
        await handleSave(updatedJob);
        setCurrentJob(null);
    }

    const handleDelete = async () => {
        if (!currentJob) return;
        if (demoMode) {
            updateUser({
                ...userInfo, jobApps: [...userInfo?.jobApps?.filter(app => app.id !== currentJob.id) || []]
            } as UserInfo);
            setCurrentJob(null);
            return;
        }
        console.log("Attempting to delete job with PK:", currentJob.PK, "and SK:", currentJob.SK);
        if (!currentJob.PK || !currentJob.SK) {
            console.error("Cannot delete job: Missing PK or SK.");
            return;
        }

        try {
            // Send PK and SK as query parameters for DELETE
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
            if (updateUser && userInfo) {
                updateUser({
                    ...userInfo,
                    jobApps: userInfo.jobApps?.filter(app => app.id !== currentJob.id) ?? []
                });
            }
            setCurrentJob(null);
        } catch (error) {
            console.error('Error deleting job:', error);
        }

    }

    return (
        <Card className="job-details-card">
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
                                <span className="job-details-date-applied"
                                    onClick={currentJob.isArchived ? undefined : () => setEditingDeadline(true)}
                                >
                                    Deadline: {editingDeadline ? (
                                        <input
                                            type="date"
                                            value={currentJob.deadline ? new Date(currentJob.deadline).toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                const newValue = e.target.value ? new Date(e.target.value) : null;
                                                setCurrentJob({ ...currentJob, deadline: newValue });
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
                                        currentJob.deadline ? currentJob.deadline.toLocaleDateString() : 'No deadline set'
                                    )}
                                </span>
                                <span className="job-details-status-container">
                                    <div className="job-details-status-wrapper">
                                        <Chip
                                            label={currentJob.jobStatus ? currentJob.jobStatus : "Draft"}
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
                                    Last Updated: {currentJob.lastUpdated ? currentJob.lastUpdated.toLocaleDateString() : 'No date provided'}
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
                                        <span className="job-details-field-text">{currentJob.source || 'No source provided'}</span>
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
                        {/* Description section - full width */}
                        <div className={`job-details-description job-details-description-section ${editingDescription ? 'editing' : ''}`}>
                            {editingDescription ? (
                                <textarea
                                    value={tempDescription}
                                    onChange={e => setTempDescription(e.target.value)}
                                        autoFocus
                                        placeholder="Enter job description..."
                                    />
                                ) : (
                                    <div className="job-details-description-text">
                                        {currentJob.description ? currentJob.description : <span style={{ color: '#888' }}>No description provided</span>}
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
                        {/* Archive, Save, and Delete Buttons */}
                        <div className="job-card-actions">
                            {!currentJob.isArchived && (
                                <>
                                    <button
                                        type="button"
                                        className="archive-button"
                                        onClick={handleArchive}
                                    >Archive</button>
                                    <button
                                        type="button"
                                        className="save-button"
                                        onClick={() => handleSave()}
                                    >Save</button>
                                </>
                            )}
                            {currentJob.isArchived && (
                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={handleDelete}
                                >Delete</button>
                            )}
                        </div>
                    </div>
                }
                {!currentJob &&
                    "No job selected."
                }
            </CardContent>
        </Card>
    );
}

export default JobDetails;