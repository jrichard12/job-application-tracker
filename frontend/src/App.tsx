import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main"
import UserHome from "./pages/UserHome/UserHome"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<UserHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;