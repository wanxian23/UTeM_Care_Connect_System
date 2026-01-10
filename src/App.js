import { Routes, Route, Link } from "react-router-dom";
import Home from "./View";
import ForgetPassword from "./ForgetPassword";

import Dashboard from "./Dashboard";
import MoodRecord from "./MoodRecord";
import EditMoodRecord from "./EditMoodRecord";
import MoodRecordView from "./MoodRecordView";
import MoodRecordViewSpecific from "./MoodRecordViewSpecific";
import Calender from "./Calender";
import CalendarMoodRecordView from "./CalendarMoodRecordView";
import Profile from "./Profile";
import Statistic from "./Statistic";
import DassAssessment from "./DassAssessment";
import ContactDetails from "./ContactDetails";
import Notification from "./Notification";

import StudentTableData from "./StudentTableData";
import StudentInfo from "./StudentInfo";
import StudentInfoStatistic from "./StudentInfoStatistic";
import ProfilePa from "./ProfilePa";
import NotificationPa from "./NotificationPa";
import StudentContactHistory from "./StudentContactHistory";
import StudentContactView from "./StudentContactView";
import EditContactNote from "./EditContactNote";

import ProfileCounsellor from "./ProfileCounsellor";
import NotificationCounsellor from "./NotificationCounsellor";
import TableDataCounselling from "./TableDataCounselling";
import StatisticCounsellor from "./StatisticCounsellor";
import PaInfo from "./PaInfo";
import StudentAssignedTable from "./StudentAssignedTable";
import StudentInfoCounselling from "./StudentInfoCounselling";
import StudentInfoStatisticCounselling from "./StudentInfoStatisticCounselling";
import StudentContactHistoryCounselling from "./StudentContactHistoryCounselling";
import StudentContactViewCounselling from "./StudentContactViewCounselling";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ForgetPassword" element={<ForgetPassword />} />

        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/MoodRecord" element={<MoodRecord />} />
        <Route path="/EditMoodRecord/:moodId/:from" element={<EditMoodRecord />} />
        <Route path="/MoodRecordView" element={<MoodRecordView />} />
        <Route path="/MoodRecordViewSpecific/:moodId" element={<MoodRecordViewSpecific />} />
        <Route path="/Calender" element={<Calender />} />
        <Route path="/CalendarMoodRecordView/:selectedDate" element={<CalendarMoodRecordView />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Statistic" element={<Statistic />} />
        <Route path="/DassAssessment/:dassId" element={<DassAssessment />} />
        <Route path="/ContactDetails/:contactId" element={<ContactDetails />} />
        <Route path="/Notification" element={<Notification />} />

        <Route path="/StudentTableData" element={<StudentTableData />} />
        {/* Note: If the url involve $_GET like got ?xxx = $xxx */}
        {/* Then inside app.js, you gonna declare/ write as below first for the url */}
        {/* Otherwise, the interface for the file would be blank */}
        <Route path="/StudentInfo/:id" element={<StudentInfo />} />
        <Route path="/StudentInfoStatistic/:id" element={<StudentInfoStatistic />} />
        <Route path="/ProfilePa" element={<ProfilePa />} />
        <Route path="/NotificationPa" element={<NotificationPa />} />
        <Route path="/StudentContactHistory/:id" element={<StudentContactHistory />} />
        <Route path="/StudentContactView/:studentId/:date" element={<StudentContactView />} />
        <Route path="/EditContactNote/:studentId/:date" element={<EditContactNote />} />

        <Route path="/ProfileCounsellor" element={<ProfileCounsellor />} />
        <Route path="/NotificationCounsellor" element={<NotificationCounsellor />} />
        <Route path="/TableDataCounselling" element={<TableDataCounselling />} />
        <Route path="/StatisticCounsellor" element={<StatisticCounsellor />} />
        <Route path="/PaInfo/:paId" element={<PaInfo />} />
        <Route path="/StudentAssignedTable/:paId" element={<StudentAssignedTable />} />
        <Route path="/StudentInfoCounselling/:studentId/:paId" element={<StudentInfoCounselling />} />
        <Route path="/StudentInfoStatisticCounselling/:studentId/:paId" element={<StudentInfoStatisticCounselling />} />
        <Route path="/StudentContactHistoryCounselling/:studentId/:paId" element={<StudentContactHistoryCounselling />} />
        <Route path="/StudentContactViewCounselling/:studentId/:paId/:date" element={<StudentContactViewCounselling />} />

      </Routes>
    </div>
  );
}

export default App;
