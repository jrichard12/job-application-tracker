/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Main from "./pages/Main/Main"
import Applications from "./pages/Applications/Applications";
import CustomAppBar from "./components/AppBar/AppBar";
import Archives from "./pages/Archives/Archives";
import Login from "./pages/Login/Login";
import { type UserInfo } from "./types/UserInfo";
import { useState, useEffect } from "react";


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
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login userInfo={userInfo} updateUser={handleUpdateUserInfo} />} />
        <Route path="/applications" element={<ProtectedRoute><Applications userInfo={userInfo} updateUser={handleUpdateUserInfo}/></ProtectedRoute>} />
        <Route path="/archives" element={<ProtectedRoute><Archives userInfo={userInfo} updateUser={handleUpdateUserInfo} /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Main /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;