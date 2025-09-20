import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography, 
    Checkbox, 
    FormControlLabel,
    IconButton,
    Box
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { UserInfo } from "../../types/UserInfo";
import "./ProfileSettingsDialog.scss";

interface ProfileSettingsDialogProps {
    open: boolean;
    onClose: () => void;
    userInfo: UserInfo | null;
    onSave: (notifications: boolean) => Promise<void>;
}

export function ProfileSettingsDialog({ open, onClose, userInfo, onSave }: ProfileSettingsDialogProps) {
    const [notifications, setNotifications] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        if (userInfo && open) {
            setNotifications(userInfo.sendNotifications || false);
            setHasChanges(false);
        }
    }, [userInfo, open]);

    const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setNotifications(newValue);
        setHasChanges(newValue !== (userInfo?.sendNotifications || false));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(notifications);
            setHasChanges(false);
            onClose();
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (userInfo) {
            setNotifications(userInfo.sendNotifications || false);
            setHasChanges(false);
        }
        onClose();
    };

    const handleClose = () => {
        if (hasChanges) {
            const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
            if (!confirmClose) return;
        }
        handleCancel();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            className="profile-settings-dialog"
        >
            <DialogTitle>
                Profile Settings
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Account Information
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Email Address
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                p: 1.5, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1, 
                                border: '1px solid',
                                borderColor: 'grey.300'
                            }}>
                                {userInfo?.email}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Notification Preferences
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={notifications}
                                        onChange={handleNotificationChange}
                                    />
                                }
                                label="Receive email notifications about application updates"
                            />
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions>
                <Button
                    onClick={handleCancel}
                    variant="outlined"
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!hasChanges || saving}
                >
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ProfileSettingsDialog;
