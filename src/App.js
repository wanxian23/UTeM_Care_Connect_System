import { Routes, Route, Link } from "react-router-dom";
import Home from "./View";
import Login from "./LoginPage";
import Dashboard from "./Dashboard";
import MoodRecord from "./MoodRecord";
import MoodRecordView from "./MoodRecordView";
import Calender from "./Calender";
import Profile from "./Profile";
import Statistic from "./Statistic";
import Logout from "./Logout";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MoodRecord" element={<MoodRecord />} />
        <Route path="/MoodRecordView" element={<MoodRecordView />} />
        <Route path="/Calender" element={<Calender />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Statistic" element={<Statistic />} />
        <Route path="/Logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App;
