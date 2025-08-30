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

  const appBarStyling = {
    background: 'var(--color-background-gradient)',
    width: '100%',
    left: 0,
    right: 0,
    boxShadow: '0 4px 15px rgba(67, 35, 113, 0.25)'
  };

  return (
    <AppBar sx={appBarStyling} position="static">
      <Toolbar>
        {/* App Icon and Title */}
        <WorkIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          fontFamily={"var(--font-family)"}
          component="a"
          href="/"
          sx={{
            mr: 3,
            fontWeight: 700,
            letterSpacing: '.2rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          App Tracker
        </Typography>

        {/* Navigation Pages */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          {pages.map((page) => (
            <Button
              key={page}
              component={Link}
              to={page === 'Home' ? '/' : `/${page.toLowerCase()}`}
              sx={{ 
                mx: 1, 
                color: 'white !important', 
                display: 'block',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white !important'
                }
              }}
            >
              {page}
            </Button>
          ))}
        </Box>

        {/* Login/Logout Button */}
        <Box>
          {user ? (
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                mx: 1,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                mx: 1,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Demo Mode Banner */}
      {demoMode && (
        <Box sx={{
          width: '100%',
          backgroundColor: '#17a2b8',
          color: 'black',
          textAlign: 'center',
          py: 1,
          fontWeight: 600,
          letterSpacing: '.1rem',
        }}>
          Demo Mode Active
        </Box>
      )}
    </AppBar>
  );
}
export default CustomAppBar;
