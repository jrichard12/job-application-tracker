import WorkIcon from '@mui/icons-material/Work';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SnackbarAlert from '../SnackbarAlert/SnackbarAlert';
import { logoutUser, useAuth } from '../../services/authService';
import { ExtensionCommunicator } from '../../services/extensionCommunicator';
import { type UserInfo } from '../../types/UserInfo';
import "./AppBar.scss";

interface AppBarProps {
  updateUser: (newInfo: UserInfo | null) => void;
}

function CustomAppBar({ updateUser }: AppBarProps) {
  const { user, setUser, demoMode, setDemoMode } = useAuth();
  const pages = ['Dashboard', 'Applications', 'Archives'];

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  }

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  }

  const handleLogout = async () => {
    if (demoMode) {
      setDemoMode(false);
      showSnackbar('Demo session ended', 'info');
    }
    else {
      logoutUser();
      showSnackbar('Successfully logged out', 'success');
    }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("demoMode");
    
    // Clear extension tokens as backup
    try {
      await ExtensionCommunicator.clearExtensionTokens();
      console.log('Extension tokens cleared from AppBar logout');
    } catch (error) {
      console.log('Extension not available or error clearing tokens from AppBar:', error);
    }
    
    setUser(null);
    updateUser(null); // Clear userInfo state as well
  };

  return (
    <>
      <AppBar className="app-bar" position="static">
        <Toolbar className="toolbar-container">
          <Box className="toolbar-content">
            <Box className="logo-section">
              <WorkIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                component={Link}
                to="/"
                className="app-title"
              >
                App Tracker
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  component={Link}
                  to={page === 'Home' ? '/' : `/${page.toLowerCase()}`}
                  className="nav-button"
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Box>
              {user ? (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  className="auth-button"
                >
                  LOGOUT
                </Button>
              ) : (
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  className="auth-button"
                >
                  LOGIN
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>

        {demoMode && (
          <Box className="demo-banner">
            <Box className="demo-banner-content">
              Demo Mode Active
            </Box>
          </Box>
        )}
      </AppBar>
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleSnackbarClose} />
    </>
  );
}
export default CustomAppBar;
