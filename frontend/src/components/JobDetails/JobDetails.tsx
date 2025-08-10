/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Chip, Divider, Typography } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import "./JobDetails.scss";
import type { JobApp } from "../../types/JobApp";
import { jobAppStatusOptions } from "../../types/JobApp";
import { useState, useEffect } from "react";
import type { UserInfo } from "../../types/UserInfo";

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
        dateApplied: job?.dateApplied ? new Date(job.dateApplied) : null,
        lastUpdated: job?.lastUpdated ? new Date(job.lastUpdated) : null,
    } : null);
    const [editingDateApplied, setEditingDateApplied] = useState(false);
    const [editingLastUpdated, setEditingLastUpdated] = useState(false);

    useEffect(() => {
        setEditingDescription(false);
        setTempDescription("");
        setCurrentJob(job ? {
            ...job,
            dateApplied: job?.dateApplied ? new Date(job.dateApplied) : null,
            lastUpdated: job?.lastUpdated ? new Date(job.lastUpdated) : null,
        } : null);
        setEditingDateApplied(false);
        setEditingLastUpdated(false);
    }, [job])

    // Revert description if not saved
    useEffect(() => {
        if (!editingDescription && tempDescription !== "" && currentJob && tempDescription !== currentJob.description) {
            setTempDescription("");
        }
    }, [editingDescription, currentJob, tempDescription]);


    const handleSave = async (jobToSave?: JobApp | null) => {
        const job = jobToSave ?? currentJob;
        if (!job || !job?.PK || !job?.SK) return;
        console.log("Saving job:", job);

        try {
            const response = await fetch(jobHandlerUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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
    };

    const handleArchive = async () => {
        if (!currentJob) return;
        console.log("currentJob before archiving:", currentJob);
        const updatedJob = { ...currentJob, isArchived: true };
        console.log("Archiving job:", updatedJob);
        if (!updatedJob.PK || !updatedJob.SK) return;
        await handleSave(updatedJob);
        setCurrentJob(null);
    }

    const handleDelete = async () => {
        if (!currentJob) return;
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
        <Card
            sx={{
                width: '100%',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 1px 6px 0 rgba(32, 165, 166, 0.07)',
                padding: '0 1vw',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            }}
        >
            <CardContent sx={{ position: 'relative', paddingBottom: '3.5rem' }}>
                {currentJob &&
                    <div className="job-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexDirection: 'column', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="h4" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                                    {currentJob.jobTitle}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.1rem' }}>
                                <span style={{ fontSize: '0.98rem', color: '#426e5d', fontWeight: 500, flex: 1, textAlign: 'left', cursor: 'pointer' }}
                                    onClick={currentJob.isArchived ? undefined : () => setEditingDateApplied(true)}
                                >
                                    Date Applied: {editingDateApplied ? (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                value={currentJob.dateApplied || null}
                                                onChange={(newValue: Date | null) => {
                                                    setCurrentJob({ ...currentJob, dateApplied: newValue });
                                                    setEditingDateApplied(false);
                                                }}
                                                onClose={() => setEditingDateApplied(false)}
                                                slotProps={{ textField: { size: 'small', sx: { fontSize: '0.98rem', width: '140px' } } }}
                                                open
                                            />
                                        </LocalizationProvider>
                                    ) : (
                                        currentJob.dateApplied ? currentJob.dateApplied.toLocaleDateString() : 'No date provided'
                                    )}
                                </span>
                                <span style={{ fontSize: '0.98rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                        <Chip
                                            label={currentJob.jobStatus ? currentJob.jobStatus : "Draft"}
                                            size="small"
                                            sx={{ fontWeight: 500, background: '#e0f7fa', color: '#1976d2', height: 22, px: 1, fontSize: '0.80rem', letterSpacing: 0.1, boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)', whiteSpace: 'nowrap', verticalAlign: 'middle', display: 'flex', alignItems: 'center', cursor: 'pointer', paddingRight: '22px' }}
                                            onClick={currentJob.isArchived ? undefined : (e) => setStatusMenuAnchor(e.currentTarget)}
                                        />
                                        {!currentJob.isArchived &&
                                            <ArrowDropDownIcon
                                                sx={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#1976d2', pointerEvents: 'none' }}
                                            />
                                        }
                                    </div>
                                    <Menu
                                        anchorEl={statusMenuAnchor}
                                        open={Boolean(statusMenuAnchor)}
                                        onClose={() => setStatusMenuAnchor(null)}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
                                                sx={{ fontSize: '0.95rem', minHeight: 32, padding: '4px 16px' }}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </span>
                                <span style={{ fontSize: '0.98rem', color: '#426e5d', fontWeight: 500, flex: 1, textAlign: 'right', cursor: 'pointer' }}
                                    onClick={currentJob.isArchived ? undefined : () => setEditingLastUpdated(true)}
                                >
                                    Last Updated: {editingLastUpdated ? (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                value={currentJob.lastUpdated || null}
                                                onChange={(newValue: Date | null) => {
                                                    setCurrentJob({ ...currentJob, lastUpdated: newValue });
                                                    setEditingLastUpdated(false);
                                                }}
                                                onClose={() => setEditingLastUpdated(false)}
                                                slotProps={{ textField: { size: 'small', sx: { fontSize: '0.98rem', width: '140px' } } }}
                                                open
                                            />
                                        </LocalizationProvider>
                                    ) : (
                                        currentJob.lastUpdated ? currentJob.lastUpdated.toLocaleDateString() : 'No date provided'
                                    )}
                                </span>
                            </div>
                        </div>
                        <Divider variant="middle" flexItem />
                        <div className="job-details-row" style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                            <span className="job-details-label">Company:</span>
                            <span className="job-details-value" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {editingField === 'company' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempFieldValue}
                                            autoFocus
                                            onChange={e => setTempFieldValue(e.target.value)}
                                            style={{
                                                fontSize: '1.08rem',
                                                color: '#222',
                                                border: 'none',
                                                borderBottom: '2px solid #1976d2',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                boxSizing: 'border-box',
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        />
                                        <IconButton size="small" sx={{ ml: 1, color: 'green' }} aria-label="Save company" onClick={() => { setCurrentJob({ ...currentJob, company: tempFieldValue }); setEditingField(null); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </IconButton>
                                        <IconButton size="small" sx={{ ml: 0.5, color: 'red' }} aria-label="Cancel company" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1 }}>{currentJob.company || 'No company provided'}</span>
                                        {!currentJob.isArchived &&
                                            <div style={{ marginLeft: 'auto' }}>
                                                <IconButton size="small" sx={{ color: '#1976d2' }} aria-label="Edit company" onClick={() => { setEditingField('company'); setTempFieldValue(currentJob.company || ""); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        }
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="job-details-row" style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                            <span className="job-details-label">Source:</span>
                            <span className="job-details-value" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {editingField === 'source' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempFieldValue}
                                            autoFocus
                                            onChange={e => setTempFieldValue(e.target.value)}
                                            style={{
                                                fontSize: '1.08rem',
                                                color: '#222',
                                                border: 'none',
                                                borderBottom: '2px solid #1976d2',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                boxSizing: 'border-box',
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        />
                                        <IconButton size="small" sx={{ ml: 1, color: 'green' }} aria-label="Save source" onClick={() => { setCurrentJob({ ...currentJob, source: tempFieldValue }); setEditingField(null); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </IconButton>
                                        <IconButton size="small" sx={{ ml: 0.5, color: 'red' }} aria-label="Cancel source" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1 }}>{currentJob.source || 'No source provided'}</span>
                                        {!currentJob.isArchived &&
                                            <div style={{ marginLeft: 'auto' }}>
                                                <IconButton size="small" sx={{ color: '#1976d2' }} aria-label="Edit source" onClick={() => { setEditingField('source'); setTempFieldValue(currentJob.source || ""); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        }
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="job-details-row" style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                            <span className="job-details-label">Location:</span>
                            <span className="job-details-value" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {editingField === 'location' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempFieldValue}
                                            autoFocus
                                            onChange={e => setTempFieldValue(e.target.value)}
                                            style={{
                                                fontSize: '1.08rem',
                                                color: '#222',
                                                border: 'none',
                                                borderBottom: '2px solid #1976d2',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                boxSizing: 'border-box',
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        />
                                        <IconButton size="small" sx={{ ml: 1, color: 'green' }} aria-label="Save location" onClick={() => { setCurrentJob({ ...currentJob, location: tempFieldValue }); setEditingField(null); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </IconButton>
                                        <IconButton size="small" sx={{ ml: 0.5, color: 'red' }} aria-label="Cancel location" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1 }}>{currentJob.location || 'No location provided'}</span>
                                        {!currentJob.isArchived &&
                                            <div style={{ marginLeft: 'auto' }}>
                                                <IconButton size="small" sx={{ color: '#1976d2' }} aria-label="Edit location" onClick={() => { setEditingField('location'); setTempFieldValue(currentJob.location || ""); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        }
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="job-details-row" style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                            <span className="job-details-label">Salary:</span>
                            <span className="job-details-value" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {editingField === 'salary' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempFieldValue}
                                            autoFocus
                                            onChange={e => setTempFieldValue(e.target.value)}
                                            style={{
                                                fontSize: '1.08rem',
                                                color: '#222',
                                                border: 'none',
                                                borderBottom: '2px solid #1976d2',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                boxSizing: 'border-box',
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        />
                                        <IconButton size="small" sx={{ ml: 1, color: 'green' }} aria-label="Save salary" onClick={() => { setCurrentJob({ ...currentJob, salary: tempFieldValue }); setEditingField(null); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </IconButton>
                                        <IconButton size="small" sx={{ ml: 0.5, color: 'red' }} aria-label="Cancel salary" onClick={() => { setEditingField(null); setTempFieldValue(""); }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1 }}>{currentJob.salary || 'No salary provided'}</span>
                                        {!currentJob.isArchived &&
                                            <div style={{ marginLeft: 'auto' }}>
                                                <IconButton size="small" sx={{ color: '#1976d2' }} aria-label="Edit salary" onClick={() => { setEditingField('salary'); setTempFieldValue(currentJob.salary || ""); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        }
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="job-details-row" style={{ display: 'flex', alignItems: editingSkills ? 'flex-start' : 'center', textAlign: 'left', minHeight: '2.6rem' }}>
                            <span className="job-details-label" style={{ marginRight: '0.7rem', marginTop: editingSkills ? 0 : '0.2rem', minWidth: 120, width: 120, display: 'inline-flex', alignItems: 'center' }}>Skills:</span>
                            <span className="job-details-value" style={{ flex: 1, display: 'flex', flexDirection: editingSkills ? 'column' : 'row', alignItems: editingSkills ? 'flex-start' : 'center', width: 'auto' }}>
                                {editingSkills ? (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={newSkill}
                                            autoFocus
                                            placeholder="Add a skill"
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && newSkill.trim()) {
                                                    if (!tempSkills.includes(newSkill.trim())) {
                                                        setTempSkills([...tempSkills, newSkill.trim()]);
                                                    }
                                                    setNewSkill("");
                                                }
                                            }}
                                            style={{
                                                fontSize: '1.08rem',
                                                color: '#222',
                                                border: 'none',
                                                borderBottom: '2px solid #1976d2',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontFamily: 'inherit',
                                                boxSizing: 'border-box',
                                                minWidth: 0,
                                                width: '140px',
                                                marginRight: '0.5rem',
                                            }}
                                        />
                                        <IconButton size="small" sx={{ ml: 1, color: 'green' }} aria-label="Save skills" onClick={() => {
                                            setCurrentJob({
                                                ...currentJob,
                                                skills: tempSkills
                                            });
                                            setEditingSkills(false);
                                            setNewSkill("");
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </IconButton>
                                        <IconButton size="small" sx={{ ml: 0.5, color: 'red' }} aria-label="Cancel skills" onClick={() => {
                                            setEditingSkills(false);
                                            setTempSkills(currentJob.skills || []);
                                            setNewSkill("");
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </IconButton>
                                    </div>
                                ) : null}
                                <div style={{ display: 'flex', alignItems: 'center', flex: editingSkills ? 'none' : 1, width: '100%', marginLeft: 0 }}>
                                    {(!editingSkills && (!currentJob.skills || currentJob.skills.length === 0)) ? (
                                        <span style={{ color: '#888', marginLeft: 0 }}>No skills listed</span>
                                    ) : (
                                        (editingSkills ? tempSkills : currentJob.skills)?.map((skill: string, idx: number) => (
                                            <Chip
                                                key={idx}
                                                label={skill}
                                                size="small"
                                                sx={{ fontWeight: 500, background: '#e0f7fa', color: '#1976d2', marginRight: '0.5rem', marginLeft: 0 }}
                                                onDelete={editingSkills ? () => {
                                                    setTempSkills(tempSkills.filter((s: string) => s !== skill));
                                                } : undefined}
                                            />
                                        ))
                                    )}
                                    {!editingSkills && !currentJob.isArchived && (
                                        <div style={{ marginLeft: 'auto' }}>
                                            <IconButton size="small" sx={{ color: '#1976d2', marginBottom: '0.5rem' }} aria-label="Edit skills" onClick={() => {
                                                setEditingSkills(true);
                                                setTempSkills(currentJob.skills || []);
                                            }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            </span>
                        </div>
                        <div className="job-details-row" style={{ width: '100%', textAlign: 'left', marginTop: '1.2rem' }}>
                            {editingDescription ? (
                                <div className="job-details-description" style={{ position: 'relative', paddingBottom: '2.2rem', background: 'rgba(32, 165, 166, 0.03)', borderRadius: 8, padding: '0.7rem 1rem', color: '#222', fontSize: '1.08rem', lineHeight: 1.6, boxSizing: 'border-box', whiteSpace: 'pre-line' }}>
                                    <textarea
                                        value={tempDescription}
                                        onChange={e => setTempDescription(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '5rem',
                                            maxHeight: '16rem',
                                            fontSize: '1.08rem',
                                            lineHeight: 1.6,
                                            background: 'transparent',
                                            borderRadius: 8,
                                            padding: 0,
                                            color: '#222',
                                            border: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            boxShadow: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        style={{ position: 'absolute', bottom: 10, right: 18, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 16px', fontSize: '0.98rem', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)' }}
                                        onClick={() => {
                                            setCurrentJob({ ...currentJob, description: tempDescription });
                                            setEditingDescription(false);
                                        }}
                                    >Save</button>
                                </div>
                            ) : (
                                <div className="job-details-description" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <span style={{ flex: 1, textAlign: 'left' }}>{currentJob.description ? currentJob.description : <span style={{ color: '#888' }}>No description provided</span>}</span>
                                    {!currentJob.isArchived &&
                                        <IconButton
                                            size="small"
                                            sx={{ ml: 1, color: '#1976d2', verticalAlign: 'middle' }}
                                            aria-label="Edit description"
                                            onClick={() => {
                                                setTempDescription(currentJob.description || "");
                                                setEditingDescription(true);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    }
                                </div>
                            )}
                        </div>
                        {/* Archive, Save, and Delete Buttons */}
                        <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', gap: '0.7rem', zIndex: 2 }}>
                            {!currentJob.isArchived && (
                                <>
                                    <button
                                        type="button"
                                        style={{ background: '#e0e0e0', color: '#1976d2', border: 'none', borderRadius: 6, padding: '6px 18px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)' }}
                                        onClick={handleArchive}
                                    >Archive</button>
                                    <button
                                        type="button"
                                        style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)' }}
                                        onClick={() => handleSave()}
                                    >Save</button>
                                </>
                            )}
                            {currentJob.isArchived && (
                                <button
                                    type="button"
                                    style={{ background: '#ff5252', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(32, 165, 166, 0.08)' }}
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