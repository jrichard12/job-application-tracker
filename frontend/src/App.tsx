import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main"
import UserHome from "./pages/UserHome/UserHome"
import Applications from "./pages/Applications/Applications";
import CustomAppBar from "./components/AppBar/AppBar";

function App() {
  return (
    <BrowserRouter>
    <CustomAppBar></CustomAppBar>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/archives" element={<Main />} />
        <Route path="/dashboard" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;