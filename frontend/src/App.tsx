import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CustomAppBar from "./components/AppBar/AppBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Applications from "./pages/Applications/Applications";
import Archives from "./pages/Archives/Archives";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Main from "./pages/Main/Main";
import { type UserInfo } from "./types/UserInfo";


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
    <BrowserRouter>
      <CustomAppBar />
      <Routes>
        <Route path="/" element={<Main userInfo={userInfo} updateUser={handleUpdateUserInfo} />} />
        <Route path="/login" element={<Login userInfo={userInfo} updateUser={handleUpdateUserInfo} />} />
        <Route path="/applications" element={<ProtectedRoute><Applications userInfo={userInfo} updateUser={handleUpdateUserInfo} /></ProtectedRoute>} />
        <Route path="/archives" element={<ProtectedRoute><Archives userInfo={userInfo} updateUser={handleUpdateUserInfo}  /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard userInfo={userInfo} updateUser={handleUpdateUserInfo} /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;