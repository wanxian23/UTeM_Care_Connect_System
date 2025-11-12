import { Routes, Route, Link } from "react-router-dom";
import Home from "./View";
import Login from "./LoginPage";
import Dashboard from "./Dashboard";
import MoodRecord from "./MoodRecord";
import MoodRecordEntries from "./MoodRecordEntries";
import Calender from "./Calender";
import Profile from "./Profile";
import Statistic from "./Statistic";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MoodRecord" element={<MoodRecord />} />
        <Route path="/MoodRecordEntries" element={<MoodRecordEntries />} />
        <Route path="/Calender" element={<Calender />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Statistic" element={<Statistic />} />
      </Routes>
    </div>
  );
}

export default App;
