import WorkIcon from '@mui/icons-material/Work';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { logoutUser, useAuth } from '../../services/authService';
import { ExtensionCommunicator } from '../../services/extensionCommunicator';
import "./AppBar.scss";

function CustomAppBar() {
  const { user, setUser, demoMode, setDemoMode } = useAuth();
  const pages = ['Home', 'Dashboard', 'Applications', 'Archives'];

  const handleLogout = async () => {
    if (demoMode) {
      setDemoMode(false);
    }
    else {
      logoutUser();
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
  };

  return (
    <AppBar className="app-bar" position="static">
      <Toolbar>
        <WorkIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="a"
          href="/"
          className="app-title"
        >
          App Tracker
        </Typography>

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
      </Toolbar>

      {demoMode && (
        <Box className="demo-banner">
          Demo Mode Active
        </Box>
      )}
    </AppBar>
  );
}
export default CustomAppBar;
