import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./css/StudentTableData.css";
import {HeaderPa, Footer} from "./HeaderFooter";

function StudentTableData() {

    const [studentTableData, setStudentTableData] = useState(null);

     useEffect(() => {
         const token = localStorage.getItem("token");
 
         if(!token){
             // No token, redirect to login
             window.location.href = "/";
             return;
         }
 
         fetch("http://localhost:8080/care_connect_system/backend/api/getStudentTableData.php", {
             method: "GET",
             headers: {
                 "Authorization": "Bearer " + token
             }
         })
         .then(res => res.json())
         .then(data => {
             console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
             
             if(data.success){
                 setStudentTableData(data);
 
             } else {
                 // Token invalid → clear storage & redirect
                 localStorage.clear();
                 window.location.href = "/";
             }
         })
         .catch(err => console.error(err));
     }, []);

    return(
        <>
            <HeaderPa />
            {/* If u write only studentInfoData without ?. then here might return null */}
            {/* Cuz here is out of useEffect(), which means here is accessing the data that havent get return back the backend yet */}
            {/* If you add ?. then the data you get is definitely return by backend already */}
            <StudentInformation studentData={studentTableData?.studentData}/>
            <Footer />
        </>
    );
}

function StudentSearch() {

    const [buttonActivation, setButtonActivation] = useState("inactive");
    const [buttonActive, setButtonActive] = useState(true);

    return(
        <>
            <section className="searchbarWrapper">
                <form>
                    <input type="text" placeholder="Type Student Name/ Matric Number"></input>
                    <input type="submit" value="Search"></input>
                </form>
                <div>
                    <button className={buttonActivation} disabled={buttonActive}>
                        Send Dass
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                        </svg>
                    </button>
                    <button>
                        Export PDF
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-pdf" viewBox="0 0 16 16">
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                            <path d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.7 11.7 0 0 0-1.997.406 11.3 11.3 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 7.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z"/>
                        </svg>
                    </button>
                </div>
            </section>
        </>
    );
}

function StudentInformation({studentData}) {

    // State to track which tab is active
    const [activeTab, setActiveTab] = useState("studentList");

    return (
        <>
            <main className="StudentInfoMain">

                {/* ===== Top Navigation Buttons ===== */}
                <nav className="tableNav">
                    <div>
                        <button 
                        className={activeTab === "studentList" ? "activeBtn" : ""} 
                        onClick={() => setActiveTab("studentList")}
                        >
                            All Student List
                        </button>
                    </div>

                    <div>
                        <button 
                            className={activeTab === "dass" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("dass")}
                        >
                            DASS Screening
                        </button>
                    </div>

                    <div>
                        <button 
                            className={activeTab === "statistics" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("statistics")}
                        >
                            Statistics
                        </button>
                    </div>

                    <div>
                        <button 
                            className={activeTab === "alerts" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("alerts")}
                        >
                            Alerts
                        </button>
                    </div>
                    
                </nav>

                {/* ====== Content Section (Changes Based on Tab) ====== */}
                <StudentSearch />
                <section className="tableContent">
                    {activeTab === "studentList" && <StudentInfoTable studentData={studentData || []} />}
                    {activeTab === "dass" && <DassTable />}
                    {activeTab === "statistics" && <StatisticsTable />}
                    {activeTab === "alerts" && <AlertsTable />}
                </section>

            </main>
        </>
    );
}

function DassTable() {
    return <div>DASS Screening Table Content Here</div>;
}

function StatisticsTable() {
    return <div>Statistics Table Content Here</div>;
}

function AlertsTable() {
    return <div>Alerts Table Content Here</div>;
}

function StudentInfoTable({studentData}) {

    const [selected, setSelected] = useState([]);

    const allSelected = selected.length === (studentData ? studentData.length : 0);

    const navigate = useNavigate();

    // Toggle all checkboxes
    const handleSelectAll = () => {
        if (allSelected) {
            setSelected([]);                 // uncheck all
        } else {
            setSelected(studentData.map(s => s.studentId));  // check all by pushing all IDs
        }
    };

    // Toggle individual checkbox
    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id)); // unselect
        } else {
            setSelected([...selected, id]);              // select
        }
    };

    if (!studentData || studentData.length === 0) {
        return (
            <>
                <table className="noRecordWrapper">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Matric Name</th>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Latest Mood</th>
                            <th>Latest Stress Level</th>
                            <th>Last Recorded Date</th>
                            <th>Risk Indicator</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={10}>No Record Yet</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    return(
        <>
            <table className="gotRecordWrapper">
                <thead>
                    <tr>
                        <th>
                            <input 
                                type="checkbox" 
                                checked={allSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Matric Name</th>
                        <th>Student Name</th>
                        <th>Latest Mood</th>
                        <th>Latest Stress Level</th>
                        <th>Last Recorded Date</th>
                        <th>Risk Indicator</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {studentData.map(student => {
                        let stressValue = student.latestStressLevel !== "No Record" ? parseInt(student.latestStressLevel) : null;
                        let moodValue = student.latestMoodStatus;
                        let stressLevel = "", stressColor = "", riskStatus = "Low Risk", riskColor = "#BFE5C8";

                        if (stressValue !== null) {
                            if (stressValue <= 20) {
                                stressLevel = "Very Low Stress";
                                stressColor = "#BFE5C8";
                            } else if (stressValue <= 40) {
                                stressLevel = "Low Stress";
                                stressColor = "#BFE5C8";
                            } else if (stressValue <= 60) {
                                stressLevel = "Moderate Stress";
                                stressColor = "#ecb385ff";
                                riskStatus = "Need Attention";
                                riskColor = "#ecb385ff";
                            } else if (stressValue <= 80) {
                                stressLevel = "High Stress";
                                stressColor = "#ea9595ff";
                                riskStatus = "High Risk";
                                riskColor = "#ff3a3aff";
                            } else {
                                stressLevel = "Very High Stress";
                                stressColor = "#ee7878ff";
                                riskStatus = "High Risk";
                                riskColor = "#ff3a3aff";
                            }
                        }

                        if (moodValue !== null) {
                            if (moodValue == "Crying" || moodValue == "Sad" || moodValue == "Anxious") {
                                riskStatus = "High Risk";
                                riskColor = "#ff3a3aff";
                            } else if (moodValue == "Annoying" || moodValue == "Angry") {
                                riskStatus = "Need Attention";
                                riskColor = "#ecb385ff";
                            }
                        }

                        const goToStudentInfo = (id) => {
                            navigate(`/StudentInfo/${id}`);
                        };

                        return (
                            <tr key={student.studentId}>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={selected.includes(student.studentId)}
                                        onChange={() => handleSelectOne(student.studentId)}
                                    />
                                </td>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <td>{student.latestMoodStatus !== "No Record" ? (
                                    <div>
                                        <img src={student.latestMoodLocation} />
                                        <label>{student.latestMoodStatus}</label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{stressValue !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: stressColor }}>
                                            {student.latestStressLevel + "%"}
                                        </label>
                                        <label>{stressLevel}</label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{student.lastRecordedDate}</td>
                                <td>{stressValue !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: riskColor }}>
                                            {riskStatus}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>
                                    <div>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                        <button>
                                            Send Dass
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
}

export default StudentTableData;