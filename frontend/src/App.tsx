/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Main from "./pages/Main/Main"
import Applications from "./pages/Applications/Applications";
import CustomAppBar from "./components/AppBar/AppBar";
import Archives from "./pages/Archives/Archives";
import Login from "./pages/Login/Login";


function App() {
  return (
      <BrowserRouter>
        <CustomAppBar></CustomAppBar>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/archives" element={<ProtectedRoute><Archives /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;