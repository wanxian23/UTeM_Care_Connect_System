import { Routes, Route, Link } from "react-router-dom";
import Home from "./View";
import Login from "./LoginPage";
import Dashboard from "./Dashboard";
import MoodRecord from "./MoodRecord";
import EditMoodRecord from "./EditMoodRecord";
import MoodRecordView from "./MoodRecordView";
import Calender from "./Calender";
import CalendarMoodRecordView from "./CalendarMoodRecordView";
import Profile from "./Profile";
import Statistic from "./Statistic";
import DassAssessment from "./DassAssessment";
import Notification from "./Notification";
import Logout from "./Logout";

import DashboardPa from "./DashboardPa";
import StudentTableData from "./StudentTableData";
import StudentInfo from "./StudentInfo";
import StatisticPa from "./StatisticPa";
import ProfilePa from "./ProfilePa";
import NotificationPa from "./NotificationPa";
import LogoutPa from "./LogoutPa";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MoodRecord" element={<MoodRecord />} />
        <Route path="/EditMoodRecord/:moodId/:from" element={<EditMoodRecord />} />
        <Route path="/MoodRecordView" element={<MoodRecordView />} />
        <Route path="/Calender" element={<Calender />} />
        <Route path="/CalendarMoodRecordView/:selectedDate" element={<CalendarMoodRecordView />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Statistic" element={<Statistic />} />
        <Route path="/DassAssessment/:dassId/:staffId/:studentId" element={<DassAssessment />} />
        <Route path="/Notification" element={<Notification />} />
        <Route path="/Logout" element={<Logout />} />

        <Route path="/DashboardPa" element={<DashboardPa />} />
        <Route path="/StudentTableData" element={<StudentTableData />} />
        {/* Note: If the url involve $_GET like got ?xxx = $xxx */}
        {/* Then inside app.js, you gonna declare/ write as below first for the url */}
        {/* Otherwise, the interface for the file would be blank */}
        <Route path="/StudentInfo/:id" element={<StudentInfo />} />
        <Route path="/StatisticPa" element={<StatisticPa />} />
        <Route path="/ProfilePa" element={<ProfilePa />} />
        <Route path="/NotificationPa" element={<NotificationPa />} />
        <Route path="/LogoutPa" element={<LogoutPa />} />
      </Routes>
    </div>
  );
}

export default App;
