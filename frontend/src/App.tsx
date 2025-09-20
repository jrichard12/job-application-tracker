import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import CustomAppBar from "./components/AppBar/AppBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Applications from "./pages/Applications/Applications";
import Archives from "./pages/Archives/Archives";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Main from "./pages/Main/Main";
import { type UserInfo } from "./types/UserInfo";

// Internal component to handle scroll to top on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Create custom MUI theme to ensure font consistency
const theme = createTheme({
  typography: {
    fontFamily: "'Noto Sans Mono', sans-serif",
    allVariants: {
      fontFamily: "'Noto Sans Mono', sans-serif",
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Noto Sans Mono', sans-serif",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Noto Sans Mono', sans-serif",
        },
      },
    },
  },
});


function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Load userInfo from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, []);

  // Save userInfo to localStorage whenever it changes
  useEffect(() => {
    console.log("Saving userInfo to localStorage:", userInfo);
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [userInfo]);

  const handleUpdateUserInfo = (newInfo: UserInfo | null) => {
    setUserInfo(newInfo);
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ScrollToTop />
        <CustomAppBar />
        <Routes>
          <Route path="/" element={<Main userInfo={userInfo} updateUser={handleUpdateUserInfo} />} />
          <Route path="/login" element={<Login userInfo={userInfo} updateUser={handleUpdateUserInfo} />} />
          <Route path="/applications" element={<ProtectedRoute><Applications userInfo={userInfo} updateUser={handleUpdateUserInfo} /></ProtectedRoute>} />
          <Route path="/archives" element={<ProtectedRoute><Archives userInfo={userInfo} updateUser={handleUpdateUserInfo}  /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard userInfo={userInfo} updateUser={handleUpdateUserInfo} /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;