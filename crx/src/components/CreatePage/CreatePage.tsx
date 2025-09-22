import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ExtensionAuthService } from "../../services/authService";
import { JobService } from "../../services/jobService";
import { jobAppStatusOptions, type JobApp } from "../../types/JobApp";
import "./CreatePage.scss";

type CreatePageProps = {
    isOpen: boolean,
    handleClose: () => void,
    handleCreateApp: (jobApp: JobApp) => void,
    initialData?: Partial<JobApp> // Optional prop for pre-populating the form
}

function CreatePage({ isOpen, handleClose, handleCreateApp, initialData }: CreatePageProps) {
    const getInitialJobApp = (): JobApp => ({
        id: '',
        source: '',
        company: '',
        jobTitle: '',
        jobStatus: 'Interested',
        isArchived: false,
        ...initialData
    } as JobApp);

    const [newJobApp, setNewJobApp] = useState<JobApp>(getInitialJobApp());
    const [skillInput, setSkillInput] = useState('');
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Update form when initialData changes
    useEffect(() => {
        if (isOpen) {
            const jobApp = getInitialJobApp();
            setNewJobApp(jobApp);
            const skillsString = jobApp.skills?.join(', ') || '';
            setSkillInput(skillsString);
            setError(null);
        }
    }, [isOpen, initialData]);

    // Check authentication status when modal opens
    useEffect(() => {
        if (isOpen) {
            ExtensionAuthService.isAuthenticated().then(setIsAuthenticated);
        }
    }, [isOpen]);

    const isFormValid = () => {
        return (
            newJobApp.company.trim() !== '' &&
            newJobApp.jobTitle.trim() !== '' &&
            newJobApp.source.trim() !== ''
        );
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid()) {
            alert('Please fill out all required fields: Source, Company, and Job Title.');
            return;
        }
        
        if (isAuthenticated === false) {
            setError('You must be logged in to save job applications. Please log in to the web app first.');
            return;
        }

        const jobToSave: JobApp = {
            ...newJobApp,
            id: uuidv4(),
            lastUpdated: new Date()
        };

        setIsSaving(true);
        setError(null);

        try {
            if (isAuthenticated) {
                // Save to backend if authenticated
                const savedJob = await JobService.saveJobApplication(jobToSave);
                console.log('Job saved to backend:', savedJob);
                handleCreateApp(savedJob);
            } else {
                // For demo or offline use, just use the local job
                console.log('Saving job locally (not authenticated)');
                handleCreateApp(jobToSave);
            }
            resetModal();
        } catch (error) {
            console.error('Error saving job:', error);
            setError(error instanceof Error ? error.message : 'Failed to save job application');
        } finally {
            setIsSaving(false);
        }
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

    const resetModal = () => {
        handleClose();
        setNewJobApp(getInitialJobApp());
        setSkillInput('');
        setIsEditingSkills(false);
        setError(null);
        setIsSaving(false);
    };

    const handleEditSkills = () => {
        const skillsString = newJobApp.skills?.join(', ') || '';
        setSkillInput(skillsString);
        setIsEditingSkills(true);
    };

    const handleSaveSkills = () => {
        const skillsArray = skillInput.trim() 
            ? skillInput.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
            : [];
        setNewJobApp(prev => ({ ...prev, skills: skillsArray }));
        setIsEditingSkills(false);
        setSkillInput('');
    };

    const handleCancelSkillEdit = () => {
        setIsEditingSkills(false);
        setSkillInput('');
    };

    return (
        <Dialog open={isOpen} onClose={resetModal} maxWidth="md" fullWidth>
            <DialogTitle>
                {initialData ? 'Review Extracted Job Data' : 'Create New Application'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
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
                            {isEditingSkills ? (
                                // Edit mode - show text input with save/cancel buttons
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Skills (comma separated)"
                                        value={skillInput}
                                        onChange={(e: any) => setSkillInput(e.target.value)}
                                        placeholder="e.g. React, TypeScript, Node.js, Python"
                                        multiline
                                        rows={2}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            onClick={handleSaveSkills}
                                        >
                                            Save
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={handleCancelSkillEdit}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                // Display mode - show skills as bullet list with edit button
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <label style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>Skills</label>
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={handleEditSkills}
                                        >
                                            {newJobApp.skills && newJobApp.skills.length > 0 ? 'Edit' : 'Add Skills'}
                                        </Button>
                                    </Box>
                                    {newJobApp.skills && newJobApp.skills.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: '56px', alignItems: 'flex-start', backgroundColor: 'white' }}>
                                            {newJobApp.skills.map((skill: string, index: number) => (
                                                <Chip
                                                    key={index}
                                                    label={skill}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ 
                                                        background: 'linear-gradient(135deg, #432371 0%, #FAAE7B 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        '& .MuiChip-label': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: '56px', display: 'flex', alignItems: 'center', color: '#999', backgroundColor: 'white' }}>
                                            No skills added yet
                                        </Box>
                                    )}
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
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            fullWidth
                            label="Date Applied"
                            name="dateApplied"
                            type="date"
                            value={newJobApp.dateApplied ? new Date(newJobApp.dateApplied).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            slotProps={{ inputLabel: { shrink: true } }}
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
                <Button onClick={resetModal} disabled={isSaving}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={isSaving || !isFormValid()}
                    startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
export default CreatePage;