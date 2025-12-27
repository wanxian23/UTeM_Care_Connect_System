import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

import "./css/StudentTableData.css";
import {HeaderPa, Footer} from "./HeaderFooter";
import MessageBox, {ConfirmationModal, TextareaModal} from "./Modal";

function StudentTableData() {

    useEffect(() => {
        document.title = "Table Data";
    }, []);

    const [studentTableData, setStudentTableData] = useState(null);
    const [dassData, setDassData] = useState(null);

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

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getDassData.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setDassData(data);

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
            {/* <SubHeader /> */}
            {/* If u write only studentInfoData without ?. then here might return null */}
            {/* Cuz here is out of useEffect(), which means here is accessing the data that havent get return back the backend yet */}
            {/* If you add ?. then the data you get is definitely return by backend already */}
            <StudentInformation studentData={studentTableData?.studentData} dassData={dassData?.studentDassData}/>
            <Footer />
        </>
    );
}

function SubHeader() {

    return(
        <>
            <main id="MoodRecordSubHeaderWrapper">
            <NavLink
                to="/StudentTableData"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader leftSelected" : "subButton"
                }
            >
            Table Data
            </NavLink>

            <NavLink
                to="/StatisticPa"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader rightSelected" : "subButton"
                }
            >
            Graph/ Chart
            </NavLink>
            </main>
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


function StudentInformation({studentData, dassData}) {

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
                    {activeTab === "dass" && (
                        <DassTable 
                            dassData={dassData || []} 
                        />
                    )}
                </section>
            </main>
        </>
    );
}

function DassTable({dassData}) {

    const navigate = useNavigate();

    // Modal button click handler
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
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

    // ✅ Combined modal state for both contact and note
    const [textareaModal, setTextareaModal] = useState({
        isOpen: false,
        purpose: "", // "contact" or "note"
        title: "",
        description: "",
        message: "",
        placeholder: "",
        maxLength: 0,
        confirmText: "",
        cancelText: "",
        noteType: "", // Only used for notes
        currentStudent: null
    });

    const closeTextareaModal = () => {
        setTextareaModal({
            isOpen: false,
            purpose: "",
            title: "",
            description: "",
            message: "",
            placeholder: "",
            maxLength: 0,
            confirmText: "",
            cancelText: "",
            noteType: "",
            currentStudent: null
        });
    };

    // ✅ Separate confirm handler that checks purpose
    const handleConfirmTextarea = async () => {
        const token = localStorage.getItem("token");
        const { currentStudent, message, purpose, noteType } = textareaModal;

        if (!currentStudent) return;

        try {
            let response;
            
            if (purpose === "contact") {
                // Send contact request
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/contactStudent.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            message: message
                        })
                    }
                );
            } else if (purpose === "note") {
                // Validate note type is selected
                if (!noteType) {
                    setMessagebox({
                        show: true,
                        title: "Note Type Required",
                        message: "Please select a note type before submitting.",
                        buttonValue: "OK",
                        redirect: false
                    });
                    return;
                }
                
                // Send note request
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/noteRecord.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            noteType: noteType,
                            message: message
                        })
                    }
                );
            }

            const result = await response.json();

            closeTextareaModal();

            setMessagebox({
                show: true,
                title: result.success 
                    ? (purpose === "contact" ? "Student Contacted Successfully" : "Note Added Successfully")
                    : (purpose === "contact" ? "Contact Failed" : "Note Failed"),
                message: result.success
                    ? (purpose === "contact" 
                        ? `A meeting notification has been sent to ${currentStudent.studentName}.`
                        : `Note has been added for ${currentStudent.studentName}.`)
                    : `Failed to ${purpose === "contact" ? "send notification" : "add note"}.`,
                buttonValue: "OK"
            });

        } catch (error) {
            console.error(error);
            closeTextareaModal();
            setMessagebox({
                show: true,
                title: purpose === "contact" ? "Contact Failed" : "Note Failed",
                message: "An error occurred while processing your request.",
                buttonValue: "OK"
            });
        }
    };

    // ✅ Open contact modal
    const handleContactBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "contact",
            title: "Contact Student",
            description: "Please review or customize the message before sending to the student.",
            message: "We would like to schedule a meeting to discuss your wellbeing and provide support. Please let us know your availability.",
            placeholder: "Write your message here...",
            maxLength: 500,
            confirmText: "Send",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

    // ✅ Open note modal
    const handleNoteBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "note",
            title: "Student Case Note",
            description: "This note is for internal reference only and will not be visible to the student.",
            message: "",
            placeholder: "Enter meeting summary, observations, or follow-up actions...",
            maxLength: 100000,
            confirmText: "Save Note",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

    // For action box part
    const actionRefs = useRef([]);
    const [openIndex, setOpenIndex] = useState(null);

    // Action box toggle
    const toggleAction = (index) => {
        const el = actionRefs.current[index];
        if (!el) return;

        if (openIndex === index) {
            gsap.to(el, {
                duration: 0.3,
                opacity: 0,
                height: 0,
                onComplete: () => {
                    el.style.display = "none";
                }
            });
            setOpenIndex(null);
        } else {
            if (openIndex !== null && actionRefs.current[openIndex]) {
                gsap.to(actionRefs.current[openIndex], {
                    duration: 0.2,
                    opacity: 0,
                    height: 0,
                    onComplete: () => {
                        actionRefs.current[openIndex].style.display = "none";
                    }
                });
            }

            el.style.display = "flex";
            gsap.fromTo(
                el,
                { opacity: 0, height: 0 },
                { duration: 0.3, opacity: 1, height: "auto" }
            );

            setOpenIndex(index);
        }
    };

    if (!dassData || dassData.length === 0) {
        return (
            <>
                <table className="dassNoRecordWrapper">
                    <thead>
                        <tr>
                            <th>Matric No</th>
                            <th>Student Name</th>
                            <th>Depression Level</th>
                            <th>Anxiety Level</th>
                            <th>Stress Level</th>
                            <th>Status</th>
                            <th>Completed Date</th>
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
            <table className="dassGotRecordWrapper">
                <thead>
                    <tr>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Depression Level</th>
                        <th>Anxiety Level</th>
                        <th>Stress Level</th>
                        <th>Status</th>
                        <th>Completed Date</th>
                        <th>Risk Indicator</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dassData.map((student, index) => {
                        let level = [], color = [];
                        level[0] = student.depressionLevel !== null ? student.depressionLevel : null;
                        level[1] = student.anxietyLevel !== null ? student.anxietyLevel : null;
                        level[2] = student.stressLevel !== null ? student.stressLevel : null;

                        let riskStatus = "Low Risk", riskColor = "#BFE5C8";
                        
                        let normalCount = 0, mildCount = 0, moderateCount = 0, severeCount = 0, extremeSevereCount = 0;
                        for (let i = 0; i < 3; i++) {
                            if (level[i] === "Normal") {
                                color[i] = "#BFE5C8";
                                normalCount++;
                            } else if (level[i] === "Mild") {
                                color[i] = "#d9f2dfff";
                                mildCount++;
                            } else if (level[i] === "Moderate") {
                                color[i] = "#e4b995ff";
                                riskStatus = "Moderate";
                                riskColor = "#ecb385ff";
                                moderateCount++;
                            } else if (level[i] === "Severe") {
                                color[i] = "#ff3a3a";
                                riskStatus = "High";
                                riskColor = "#ff3a3a";
                                severeCount++;
                            } else if (level[i] === "Extremely Severe") {
                                color[i] = "#ff3a3a";
                                riskStatus = "Critical";
                                riskColor = "#ff3a3a";
                                extremeSevereCount++;
                            }
                        }

                        if (extremeSevereCount > 0) {
                            riskStatus = "Critical";
                            riskColor = "#ff3a3a";
                        } else if (extremeSevereCount === 0 && severeCount > 0) {
                            riskStatus = "High";
                            riskColor = "#ff8181ff";
                        } else if (severeCount === 0 && moderateCount > 0) {
                            riskStatus = "Medium";
                            riskColor = "#ecb385ff";
                        } else if (moderateCount === 0) {
                            riskStatus = "Low";
                            riskColor = "#BFE5C8";
                        } else {
                            riskStatus = "Low";
                            riskColor = "#BFE5C8";
                        }

                        const goToStudentInfo = (id) => {
                            navigate(`/StudentInfo/${id}`);
                        };

                        return (
                            <tr key={student.studentId}>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <td>{level[0] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[0] }}>
                                            {level[0]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{level[1] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[1] }}>
                                            {level[1]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{level[2] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[2] }}>
                                            {level[2]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{student.dassStatus}</td>
                                <td>{student.completedDate}</td>
                                <td>{level[0] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: riskColor }}>
                                            {riskStatus}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                        {(riskStatus == "High" || riskStatus == "Critical") && 
                                            <>
                                               {student.contactRecord ?
                                                    <>
                                                        {!student.noteRecord && 
                                                            <button onClick={() => handleNoteBox(student)}>
                                                                Add Note
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-plus" viewBox="0 0 16 16">
                                                                    <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
                                                                    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
                                                                    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                                                                </svg>
                                                            </button> 
                                                        }
                                                    </> 
                                                :
                                                    <button onClick={() => handleContactBox(student)}>
                                                        Contact Student
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                                                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                                        </svg>
                                                    </button>   
                                                }
                                            </> 
                                        }
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
            <TextareaModal
                show={textareaModal.isOpen}
                purpose={textareaModal.purpose}
                title={textareaModal.title}
                description={textareaModal.description}
                placeholder={textareaModal.placeholder}
                value={textareaModal.message}
                onChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        message: value
                    }))
                }
                noteType={textareaModal.noteType}
                onNoteTypeChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        noteType: value
                    }))
                }
                maxLength={textareaModal.maxLength}
                confirmText={textareaModal.confirmText}
                cancelText={textareaModal.cancelText}
                onConfirm={handleConfirmTextarea}
                onCancel={closeTextareaModal}
            />
        </>
    );
}

function StudentInfoTable({studentData, selected, setSelected}) {
    const allSelected = selected.length === (studentData ? studentData.length : 0);
    const navigate = useNavigate();

    const handleSelectAll = () => {
        if (allSelected) {
            setSelected([]);
        } else {
            setSelected(studentData.map(s => s.studentId));
        }
    };

    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
        if (shouldRedirect) {
            window.location.href = "/StudentTableData";
        }
    };

    // ✅ Combined modal state for both contact and note
    const [textareaModal, setTextareaModal] = useState({
        isOpen: false,
        purpose: "", // "contact" or "note"
        title: "",
        description: "",
        message: "",
        placeholder: "",
        maxLength: 0,
        confirmText: "",
        cancelText: "",
        noteType: "", // Only used for notes
        currentStudent: null
    });

    const closeTextareaModal = () => {
        setTextareaModal({
            isOpen: false,
            purpose: "",
            title: "",
            description: "",
            message: "",
            placeholder: "",
            maxLength: 0,
            confirmText: "",
            cancelText: "",
            noteType: "",
            currentStudent: null
        });
    };

    // ✅ Separate confirm handler that checks purpose
    const handleConfirmTextarea = async () => {
        const token = localStorage.getItem("token");
        const { currentStudent, message, purpose, noteType } = textareaModal;

        if (!currentStudent) return;

        try {
            let response;
            
            if (purpose === "contact") {
                // Send contact request
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/contactStudent.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            message: message
                        })
                    }
                );
            } else if (purpose === "note") {
                // Validate note type is selected
                if (!noteType) {
                    setMessagebox({
                        show: true,
                        title: "Note Type Required",
                        message: "Please select a note type before submitting.",
                        buttonValue: "OK",
                        redirect: false
                    });
                    return;
                }
                
                // Send note request
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/noteRecord.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            noteType: noteType,
                            message: message
                        })
                    }
                );
            }

            const result = await response.json();

            closeTextareaModal();

            setMessagebox({
                show: true,
                title: result.success 
                    ? (purpose === "contact" ? "Student Contacted Successfully" : "Note Added Successfully")
                    : (purpose === "contact" ? "Contact Failed" : "Note Failed"),
                message: result.success
                    ? (purpose === "contact" 
                        ? `A meeting notification has been sent to ${currentStudent.studentName}.`
                        : `Note has been added for ${currentStudent.studentName}.`)
                    : `Failed to ${purpose === "contact" ? "send notification" : "add note"}.`,
                buttonValue: "OK"
            });

        } catch (error) {
            console.error(error);
            closeTextareaModal();
            setMessagebox({
                show: true,
                title: purpose === "contact" ? "Contact Failed" : "Note Failed",
                message: "An error occurred while processing your request.",
                buttonValue: "OK"
            });
        }
    };

    // ✅ Open contact modal
    const handleContactBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "contact",
            title: "Contact Student",
            description: "Please review or customize the message before sending to the student.",
            message: "We would like to schedule a meeting to discuss your wellbeing and provide support. Please let us know your availability.",
            placeholder: "Write your message here...",
            maxLength: 500,
            confirmText: "Send",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

    // ✅ Open note modal
    const handleNoteBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "note",
            title: "Student Case Note",
            description: "This note is for internal reference only and will not be visible to the student.",
            message: "",
            placeholder: "Enter meeting summary, observations, or follow-up actions...",
            maxLength: 100000,
            confirmText: "Save Note",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

    // For form handling and messageBox (Modal)
    const [confirmationBox, setConfirmationBox] = useState({
        show: false,
        title: "",
        message: "",
        confirmText: "",
        cancelText: "",
        onConfirm: null,
        onCancel: null
    });

    const openDassModal = async (student) => {
        setConfirmationBox({
            show: true,
            title: "Send Dass to Student?",
            message: "This action cannot be undone.",
            confirmText: "Send",
            cancelText: "Cancel",
            onConfirm: async () => {
                setConfirmationBox(prev => ({ ...prev, show: false }));

                const token = localStorage.getItem("token");

                try {
                    const response = await fetch(`http://localhost:8080/care_connect_system/backend/api/sendDass.php?studentId=${student.studentId}`, {
                            method: "GET",
                            headers: { "Authorization": "Bearer " + token }
                        }
                    );

                    const result = await response.json();
                        setMessagebox({
                        show: true,
                        title: result.success ? "DASS Assessment Sent Successfully" : "DASS Assessment Failed To Send",
                        message: result.success
                            ? `DASS Assessment has been sent successfully to ${student.studentName}.`
                            : `Failed to send DASS Assessment to ${student.studentName}.`,
                        buttonValue: "OK"
                });
                } catch (error) {
                    console.error(error);
                    setMessagebox({
                        show: true,
                        title: "DASS Assessment Failed To Send",
                        message: `Failed to send DASS Assessment to ${student.studentName} due to error`,
                        buttonValue: "OK"
                    });
                }
            },
            onCancel: () =>
                setConfirmationBox(prev => ({ ...prev, show: false }))
        });
    };

    const actionRefs = useRef([]);
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAction = (index) => {
        const el = actionRefs.current[index];
        if (!el) return;

        if (openIndex === index) {
            gsap.to(el, {
                duration: 0.3,
                opacity: 0,
                height: 0,
                onComplete: () => {
                    el.style.display = "none";
                }
            });
            setOpenIndex(null);
        } else {
            if (openIndex !== null && actionRefs.current[openIndex]) {
                gsap.to(actionRefs.current[openIndex], {
                    duration: 0.2,
                    opacity: 0,
                    height: 0,
                    onComplete: () => {
                        actionRefs.current[openIndex].style.display = "none";
                    }
                });
            }

            el.style.display = "flex";
            gsap.fromTo(
                el,
                { opacity: 0, height: 0 },
                { duration: 0.3, opacity: 1, height: "auto" }
            );

            setOpenIndex(index);
        }
    };

    if (!studentData || studentData.length === 0) {
        return (
            <table className="noRecordWrapper">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Period</th>
                        <th>Mood Pattern</th>
                        <th>Stress Pattern</th>
                        <th>Trend</th>
                        <th>Risk</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan={9}>No Record Yet</td></tr>
                </tbody>
            </table>
        );
    }

    return (
        <>
            <table className="gotRecordWrapper">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Period</th>
                        <th>Mood Pattern</th>
                        <th>Stress Pattern</th>
                        <th>Trend</th>
                        <th>Risk</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {studentData.map((student, index) => {
                        const goToStudentInfo = (id) => navigate(`/StudentInfo/${id}`);
                        const riskColor =
                            student.riskIndicator === "High Risk" ? "#ff3a3a" :
                            student.riskIndicator === "Need Attention" ? "#ecb385" : "#BFE5C8";

                        return (
                            <tr key={student.studentId}>
                                <td><input type="checkbox" checked={selected.includes(student.studentId)} onChange={() => handleSelectOne(student.studentId)} /></td>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <td>{student.period}</td>
                                <td>{student.moodPattern}</td>
                                <td>{student.stressPattern}</td>
                                <td>{student.trend}</td>
                                <td><span style={{ backgroundColor: riskColor, padding: '5px 10px', borderRadius: '5px' }}>{student.riskIndicator}</span></td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => openDassModal(student)}>
                                            Send Dass
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                            </svg>
                                        </button>
                                        {student.riskIndicator === "High Risk" && 
                                            <>
                                                {student.contactRecord ?
                                                    <>
                                                        {!student.noteRecord && 
                                                            <button onClick={() => handleNoteBox(student)}>
                                                                Add Note
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-journal-plus" viewBox="0 0 16 16">
                                                                    <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
                                                                    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
                                                                    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                                                                </svg>
                                                            </button> 
                                                        }
                                                    </>
                                                :
                                                    <button onClick={() => handleContactBox(student)}>
                                                        Contact Student
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                                                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                                        </svg>
                                                    </button>   
                                                }
                                            </> 
                                        }
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <ConfirmationModal
                show={confirmationBox.show}
                title={confirmationBox.title}
                message={confirmationBox.message}
                confirmText={confirmationBox.confirmText}
                cancelText={confirmationBox.cancelText}
                onConfirm={confirmationBox.onConfirm}
                onCancel={confirmationBox.onCancel}
            />
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
            {/* ✅ Single TextareaModal that adapts based on purpose */}
            <TextareaModal
                show={textareaModal.isOpen}
                purpose={textareaModal.purpose}
                title={textareaModal.title}
                description={textareaModal.description}
                placeholder={textareaModal.placeholder}
                value={textareaModal.message}
                onChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        message: value
                    }))
                }
                noteType={textareaModal.noteType}
                onNoteTypeChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        noteType: value
                    }))
                }
                maxLength={textareaModal.maxLength}
                confirmText={textareaModal.confirmText}
                cancelText={textareaModal.cancelText}
                onConfirm={handleConfirmTextarea}
                onCancel={closeTextareaModal}
            />
        </>
    );
}

export default StudentTableData;