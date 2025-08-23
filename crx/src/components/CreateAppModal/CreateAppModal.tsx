import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { jobAppStatusOptions, type JobApp } from "../../types/JobApp";
import "./CreateAppModal.scss";

type CreateAppModalProps = {
    isOpen: boolean,
    handleClose: () => void,
    handleCreateApp: (jobApp: JobApp) => void
}

function CreateAppModal({ isOpen, handleClose, handleCreateApp }: CreateAppModalProps) {
    const [newJobApp, setNewJobApp] = useState<JobApp>({
        id: '',
        source: '',
        company: '',
        jobTitle: '',
        jobStatus: 'Interested',
        isArchived: false
    } as JobApp);
    const [skillInput, setSkillInput] = useState('');

    const isFormValid = () => {
        return (
            newJobApp.company.trim() !== '' &&
            newJobApp.jobTitle.trim() !== '' &&
            newJobApp.source.trim() !== ''
        );
    };

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid()) {
            alert('Please fill out all required fields: Source, Company, and Job Title.');
            return;
        }
        
        const jobToSave: JobApp = {
            ...newJobApp,
            id: uuidv4(),
            lastUpdated: new Date(),
            skills: skillInput.trim() ? skillInput.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : newJobApp.skills
        };
        handleCreateApp(jobToSave);
        resetModal();
    };

    const handleInputChange = (event: any) => {
        const prop = event.target.name;
        const value = event.target.value;
        
        if (prop === 'deadline' || prop === 'dateApplied') {
            setNewJobApp(prev => ({ 
                ...prev, 
                [prop]: value ? new Date(value) : null 
            }));
        } else {
            setNewJobApp(prev => ({ ...prev, [prop]: value }));
        }
    };

    const handleDeleteSkill = (index: number) => {
        setNewJobApp({
            ...newJobApp,
            skills: newJobApp.skills?.filter((_, i) => i !== index) || []
        });
    };

    const resetModal = () => {
        handleClose();
        setNewJobApp({
            id: '',
            source: '',
            company: '',
            jobTitle: '',
            jobStatus: 'Interested',
            isArchived: false
        } as JobApp);
        setSkillInput('');
    };

    return (
        <Dialog open={isOpen} onClose={resetModal} maxWidth="md" fullWidth>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSave} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                name="jobTitle"
                                value={newJobApp.jobTitle}
                                onChange={handleInputChange}
                                placeholder="e.g. Senior Software Engineer"
                                required
                            />
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                label="Company"
                                name="company"
                                value={newJobApp.company}
                                onChange={handleInputChange}
                                placeholder="e.g. Google, Microsoft, Startup Inc."
                                required
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Location"
                            name="location"
                            value={newJobApp.location ?? ''}
                            onChange={handleInputChange}
                            placeholder="e.g. New York, NY or Remote"
                        />
                        <TextField
                            fullWidth
                            label="Salary"
                            name="salary"
                            value={newJobApp.salary ?? ''}
                            onChange={handleInputChange}
                            placeholder="e.g. $80,000 - $120,000"
                        />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                label="Source URL"
                                name="source"
                                value={newJobApp.source}
                                onChange={handleInputChange}
                                placeholder="e.g. https://company.com/careers/job-123"
                                required
                            />
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={4}
                                value={newJobApp.description ?? ''}
                                onChange={handleInputChange}
                                placeholder="Paste the job description here or add your own notes..."
                            />
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <TextField
                                fullWidth
                                label="Skills (comma separated)"
                                value={skillInput}
                                onChange={(e: any) => setSkillInput(e.target.value)}
                                placeholder="e.g. React, TypeScript, Node.js, Python"
                            />
                            {newJobApp.skills && newJobApp.skills.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {newJobApp.skills.map((skill: string, index: number) => (
                                        <Chip
                                            key={index}
                                            label={skill}
                                            variant="outlined"
                                            onDelete={() => handleDeleteSkill(index)}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <TextField
                            fullWidth
                            label="Application Deadline"
                            name="deadline"
                            type="date"
                            value={newJobApp.deadline ? new Date(newJobApp.deadline).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Date Applied"
                            name="dateApplied"
                            type="date"
                            value={newJobApp.dateApplied ? new Date(newJobApp.dateApplied).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={newJobApp.jobStatus}
                                    label="Status"
                                    onChange={(e: any) => setNewJobApp(prev => ({ ...prev, jobStatus: e.target.value as JobApp["jobStatus"] }))}
                                >
                                    {jobAppStatusOptions.map(option => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={resetModal}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
export default CreateAppModal;