import WorkIcon from '@mui/icons-material/Work';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { logoutUser, useAuth } from '../../services/authService';
import "./AppBar.scss";


function CustomAppBar() {
  const { user, setUser, demoMode, setDemoMode } = useAuth();

  const pages = ['Home', 'Applications', 'Archives'];

  const handleLogout = () => {
    if (demoMode) {
      setDemoMode(false);
    }
    else {
      logoutUser();
    }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("demoMode");
    setUser(null);
  };

  const appBarStyling = {
    backgroundColor: 'var(--color-primary)',
    width: '100%',
    left: 0,
    right: 0
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
                color: 'white', 
                display: 'block',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
          backgroundColor: 'var(--color-demo-banner, #FFA726)',
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
