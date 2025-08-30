import { Alert, Snackbar } from '@mui/material';
import Grow, { type GrowProps } from '@mui/material/Grow';
import React from 'react';
import './SnackbarAlert.scss';

type Severity = 'error' | 'warning' | 'info' | 'success';

type SnackbarAlertProps = {
    open: boolean;
    message: string;
    severity?: Severity;
    autoHideDuration?: number;
    onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
};

export default function SnackbarAlert({ open, message, severity = 'info', autoHideDuration = 4000, onClose }: SnackbarAlertProps) {
    function GrowTransition(props: GrowProps) {
        return <Grow {...props} />;
    }

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            slots={{ transition: GrowTransition }}
            transitionDuration={300}
        >
            <Alert onClose={onClose} severity={severity} className={`snackbar-alert snackbar-alert--${severity}`} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
