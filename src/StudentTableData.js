import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./css/StudentTableData.css";
import {HeaderPa, Footer} from "./HeaderFooter";
import MessageBox from "./Modal";

function StudentTableData() {

    useEffect(() => {
        document.title = "Table Data";
    }, []);

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

function StudentSearch({selected, activeTab}) { // ✅ Accept selected prop

    const buttonActivation = selected.length > 0 ? "active" : "inactive";
    const buttonActive = selected.length === 0;

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = "/StudentTableData";
        }
    };

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const handleSendDass = async () => {
        if (selected.length === 0) return;

        const token = localStorage.getItem("token");
        
        // Send DASS notification to each selected student
        try {
            const promises = selected.map(studentId => 
                fetch(`http://localhost:8080/care_connect_system/backend/api/sendDass.php?studentId=${studentId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                })
                .then(res => res.json())
            );

            const results = await Promise.all(promises);
            
            // Check if all succeeded
            const allSuccess = results.every(r => r.success);
            
            if (allSuccess) {
                setMessagebox({
                    ...messagebox,
                    show: true,
                    title: "DASS Assessment Sent Successfully",
                    message: `DASS Assessment has been sent successfully to ${selected.length} student(s).`,
                    buttonValue: "OK"
                });
            } else {
                setMessagebox({
                    ...messagebox,
                    show: true,
                    title: "DASS Assessment Failed To Sent",
                    message: `Failed to send DASS Assessment to ${selected.length} students.`,
                    buttonValue: "OK"
                });
            }
        } catch (error) {
            console.error(error);
            setMessagebox({
                ...messagebox,
                show: true,
                title: "DASS Assessment Failed To Sent",
                message: `Failed to send DASS Assessment to ${selected.length} students due to error problem`,
                buttonValue: "OK"
            });
        }
    };

    return(
        <>
            <section className="searchbarWrapper">
                <form>
                    <input type="text" placeholder="Type Student Name/ Matric Number"></input>
                    <input type="submit" value="Search"></input>
                </form>
                <div>
                    {activeTab === "studentList" ?
                    <button 
                        className={buttonActivation} 
                        disabled={buttonActive}
                        onClick={handleSendDass}
                    >
                        Send Dass ({selected.length})
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                        </svg>
                    </button>
                    :
                        <></>
                    }
                    <button>
                        Export CSV
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filetype-csv" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
                        </svg>
                    </button>
                </div>
            </section>
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
        </>
    );
}


function StudentInformation({studentData}) {

    const [activeTab, setActiveTab] = useState("studentList");
    const [selected, setSelected] = useState([]); // ✅ Move selected state here

    return (
        <>
            <main className="StudentInfoMain">
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
                            className={activeTab === "alerts" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("alerts")}
                        >
                            Alerts
                        </button>
                    </div>
                </nav>

                <StudentSearch selected={selected} studentData={studentData || []} activeTab={activeTab} /> {/* ✅ Pass selected */}
                <section className="tableContent">
                    {activeTab === "studentList" && (
                        <StudentInfoTable 
                            studentData={studentData || []} 
                            selected={selected}
                            setSelected={setSelected} // ✅ Pass down
                        />
                    )}
                    {activeTab === "dass" && <DassTable />}
                    {activeTab === "alerts" && <AlertsTable />}
                </section>
            </main>
        </>
    );
}

function DassTable() {
    return <div>DASS Screening Table Content Here</div>;
}

function AlertsTable() {
    return <div>Alerts Table Content Here</div>;
}

function StudentInfoTable({studentData, selected, setSelected}) {

    // const [selected, setSelected] = useState([]);

    const allSelected = selected.length === (studentData ? studentData.length : 0);

    const navigate = useNavigate();

    // Toggle all checkboxes
    const handleSelectAll = () => {
        if (allSelected) {
            setSelected([]);
        } else {
            setSelected(studentData.map(s => s.studentId));
        }
    };

    // Toggle individual checkbox
    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = "/StudentTableData";
        }
    };

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    useEffect(() => {
        console.log("Student ID: ". studentData?.studentId);
    });

    const handleSendDass = async (student) => {

        const token = localStorage.getItem("token");
        
        // Send DASS notification to each selected student
        try {
            fetch(`http://localhost:8080/care_connect_system/backend/api/sendDass.php?studentId=${student.studentId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            .then(res => res.json())
            .then(data => {
                     console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
                     
                     if(data.success){
                        setMessagebox({
                            ...messagebox,
                            show: true,
                            title: "DASS Assessment Sent Successfully",
                            message: `DASS Assessment has been sent successfully to ${student.studentName}.`,
                            buttonValue: "OK"
                        });
                     } else {
                         setMessagebox({
                            ...messagebox,
                            show: true,
                            title: "DASS Assessment Failed To Sent",
                            message: `Failed to send DASS Assessment to ${student.studentName}.`,
                            buttonValue: "OK"
                        });
                     }
                 })
                 .catch(err => console.error(err));
        } catch (error) {
            console.error(error);
            setMessagebox({
                show: true,
                title: "DASS Assessment Failed To Sent",
                message: `Failed to send DASS Assessment to ${student.studentName} due to error problem`,
                buttonValue: "OK"
            });
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
                            <th>Matric No</th>
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
                        <th>Matric No</th>
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
                                        <button onClick={() => handleSendDass(student)}>
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
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
        </>
    );
}

export default StudentTableData;