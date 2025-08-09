/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, FormControl, Input, InputLabel, MenuItem, Select, Step, StepContent, StepLabel, Stepper, TextField, Typography } from "@mui/material";
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
        status: 'Interested',
        isArchived: false
    } as JobApp);
    const [activeStep, setActiveStep] = useState(0);
    const [skillInput, setSkillInput] = useState('');

    const isFormValid = () => {
        return (
            newJobApp.company.trim() !== '' &&
            newJobApp.jobTitle.trim() !== '' &&
            newJobApp.source.trim() !== ''
        );
    };

    const handleSaveJob = () => {
        const jobToSave: JobApp = {
            ...newJobApp,
            id: uuidv4(),
            statusUpdated: new Date()
        };
        handleCreateApp(jobToSave);
        resetModal();
    };

    const handleNext = () => {
        if (activeStep === 3) {
            if (!isFormValid()) {
                alert('Please fill out all required fields: Source, Company, and Job Title.');
                return;
            }
            handleSaveJob();
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleInputChange = (event: any) => {
        const prop = event.target.name;
        const value = event.target.value;
        setNewJobApp(prev => ({ ...prev, [prop]: value }));
    };

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (!trimmed) return;
        if (newJobApp.skills && newJobApp.skills.includes(trimmed)) return;
        setNewJobApp({
            ...newJobApp,
            skills: [...(newJobApp.skills || []), trimmed]
        });
        setSkillInput('');
    };

    const handleDeleteSkill = (index: number) => {
        setNewJobApp({
            ...newJobApp,
            skills: newJobApp.skills?.filter((_, i) => i !== index) || []
        });
    };

    const resetModal = () => {
        setActiveStep(0);
        handleClose();
        setNewJobApp({
            id: '',
            source: '',
            company: '',
            jobTitle: '',
            status: 'Interested',
            isArchived: false
        } as JobApp);
    };

    const buttonBox = () => {
        return (
            <Box sx={{ mt: 3, mb: 1, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ minWidth: 120 }}
                >
                    {activeStep === 3 ? 'Save' : 'Continue'}
                </Button>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ minWidth: 100 }}
                >
                    Back
                </Button>
            </Box>
        );
    }

    const step1 = () => {
        const showError = (!isFormValid() && (activeStep !== 0));
        return (
            <Step>
                <StepLabel error={showError}>
                    Important Details
                </StepLabel>
                <StepContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 2, mt: 1 }}>
                        <FormControl sx={{ maxWidth: 350 }} error={newJobApp.jobTitle.trim() === ""}>
                            <InputLabel>Job Title*</InputLabel>
                            <Input name="jobTitle" value={newJobApp.jobTitle} onChange={handleInputChange} required />
                        </FormControl>
                        <FormControl sx={{ maxWidth: 350 }} error={newJobApp.company.trim() === ""}>
                            <InputLabel>Company*</InputLabel>
                            <Input name="company" value={newJobApp.company} onChange={handleInputChange} required />
                        </FormControl>
                        <FormControl sx={{ maxWidth: 350 }} error={newJobApp.source.trim() === ""}>
                            <InputLabel>Source*</InputLabel>
                            <Input name="source" value={newJobApp.source} onChange={handleInputChange} required />
                        </FormControl>
                        <FormControl sx={{ maxWidth: 350 }}>
                            <InputLabel>Location</InputLabel>
                            <Input name="location" value={newJobApp.location ?? ''} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl sx={{ maxWidth: 350 }}>
                            <InputLabel>Salary</InputLabel>
                            <Input name="salary" value={newJobApp.salary ?? ''} onChange={handleInputChange} />
                        </FormControl>
                    </Box>
                    {showError && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                            Please fill out all required fields: Source, Company, and Job Title.
                        </Typography>
                    )}
                    {buttonBox()}
                </StepContent>
            </Step>
        );
    };

    // Step 2: Skills
    const step2 = () => {
        return (
            <Step>
                <StepLabel>
                    Skills & Tech
                </StepLabel>
                <StepContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 1, maxWidth: 500 }}>
                        <TextField
                            variant="standard"
                            placeholder="Add skill"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleAddSkill();
                                    e.preventDefault();
                                }
                            }}
                            sx={{ minWidth: 120, maxWidth: 300 }}
                        />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mt: 1 }}>
                            {newJobApp.skills && newJobApp.skills.map((skill: string, index: number) => (
                                <Chip
                                    key={index}
                                    label={skill}
                                    variant="outlined"
                                    onDelete={() => handleDeleteSkill(index)}
                                    sx={{ mb: 0.5 }}
                                />
                            ))}
                        </Box>
                    </Box>
                    {buttonBox()}
                </StepContent>
            </Step>
        );
    };

    // Step 3: Description/Notes
    const step3 = () => {
        return (
            <Step>
                <StepLabel>
                    Description / Notes
                </StepLabel>
                <StepContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 2, mt: 1, maxWidth: 500 }}>
                        <TextField
                            id="outlined-multiline-flexible"
                            name="description"
                            onChange={(e: any) => handleInputChange(e)}
                            multiline
                            minRows={3}
                            maxRows={6}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                    {buttonBox()}
                </StepContent>
            </Step>
        );
    };

    return (
        <div className="create-app-modal">
            <Dialog open={isOpen} onClose={resetModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: "center", position: 'relative', p: 2 }}>
                    Create a Job Application
                    <Button
                        aria-label="close"
                        onClick={resetModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            minWidth: 0,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            color: 'grey.500',
                            fontSize: 22,
                            p: 0,
                        }}
                    >
                        ×
                    </Button>
                </DialogTitle>
                <DialogContent sx={{
                    overflowX: 'hidden',
                    p: { xs: 1, sm: 3 },
                    boxSizing: 'border-box',
                    maxWidth: '100vw',
                }}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {step1()}
                        {step2()}
                        {step3()}
                        <Step>
                            <StepLabel>
                                Save
                            </StepLabel>
                            <StepContent>
                                <Typography sx={{ mb: 2 }}>{'Select a status and save your application.'}</Typography>
                                <FormControl sx={{ minWidth: 200, mb: 2 }}>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        id="status-select"
                                        value={newJobApp.status}
                                        label="Status"
                                        onChange={e => setNewJobApp(prev => ({ ...prev, status: e.target.value as JobApp["status"] }))}
                                    >
                                        {jobAppStatusOptions.map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {buttonBox()}
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>
            </Dialog>
        </div>
    );
}
export default CreateAppModal;