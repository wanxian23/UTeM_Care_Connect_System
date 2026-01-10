import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderPa, Footer } from "./HeaderFooter";
import { NavLink } from "react-router-dom";
import MessageBox from "./Modal";

import "./css/StudentContactView.css";

function StudentContactView() {
    useEffect(() => {
        document.title = "Contact Details";
    }, []);

    const [contactData, setContactData] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { studentId, date } = useParams();
    const navigate = useNavigate();

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });

        if (shouldRedirect) {
            navigate(`/StudentContactView/${studentId}/${date}`);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/";
            return;
        }

        fetch(`http://localhost:8080/care_connect_system/backend/api/getStudentContactCalendarDetails.php?studentId=${studentId}&selectedDate=${date}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("CONTACT VIEW RESPONSE:", data);
            
            if (data.success) {
                setStudentData(data.studentData);
                
                // Get contacts for the specific date
                setContactData(data.contactData);

                setTrendData(data.trendData);
                setLoading(false);
            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [studentId, date]);

    if (loading) {
        return (
            <>
                <HeaderPa />
                <main className="contactViewMain">
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        Loading...
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!contactData || contactData.length === 0) {
        return (
            <>
                <HeaderPa />
                <main className="contactViewMain">
                    <div className="contactViewWrapper">
                        <h2>No Contact Record Found</h2>
                        <p>No contact record exists for {date}</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const formatDay = (day) => {
        return new Date(day).toLocaleDateString("en-GB", {
        weekday: "long"
    });
    }

    // Format date for display
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    // Format time
    const formatTime = (datetime) => {
        return new Date(datetime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Get last 7 days
    const subtractDays = (dateStr, days) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() - days);
        return date;
    };

    const formatLast7DaysTimeline = (dateStr) => {
        const endDate = new Date(dateStr);
        const startDate = subtractDays(dateStr, 6); // inclusive 7 days

        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    // Use to complete the form
    const token = localStorage.getItem("token");
    const handleEditContactNote = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch(`http://localhost:8080/care_connect_system/backend/api/updateStudentContact.php?studentId=${studentId}&date=${date}`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const result = await response.json();

        if(result.success){
            setMessagebox({
                show: true,
                title: "Details Updated Successful",
                message: "Student contact and note details updated successfully",
                buttonValue: "OK",
                redirect: true
            });
        } else {
            setMessagebox({
                show: true,
                title: "Details Updated Failed",
                message: result.message,
                buttonValue: "Try Again",
                redirect: false
            });
        }

    };

    return (
        <>
            <HeaderPa />
            <main className="studentInfoContentMain">
                <SubHeader studentId={studentId} />
                <section className="studentInfoContentWrapper">
                    <article className="contactInfoWrapper">
                        <div className="contactHeader">
                            <h1 className="sectionTitle">Edit Contact Details</h1>
                        </div>
                        <div className="contactDateTimeWrapper">
                            <h2>{formatDay(date)}</h2>
                            <h2>{formatDate(date)}</h2>
                            <h2>{formatTime(date)}</h2>
                        </div>

                        <div className="studentInfoBox">
                            <h3 className="sectionTitle smallTitle">Mood Condition Last 7 Days</h3>
                            <div className="infoGrid">
                                <div className="infoItem">
                                    <h4 className="infoLabel">Timeline</h4>
                                    <span className="infoValue">{formatLast7DaysTimeline(date)}</span>
                                </div>
                                <div className="infoItem">
                                    <h4 className="infoLabel">Mood Pattern</h4>
                                    <span className="infoValue">{trendData.moodPattern}</span>
                                </div>
                                <div className="infoItem">
                                    <h4 className="infoLabel">Stress Pattern</h4>
                                    <span className="infoValue">{trendData.stressPattern}</span>
                                </div>
                                <div className="infoItem">
                                    <h4 className="infoLabel">Trend</h4>
                                    <span className="infoValue">{trendData.trend}</span>
                                </div>
                                <div className="infoItem">
                                    <h4 className="infoLabel">Risk Indicator</h4>
                                    <span className="infoValue">{trendData.riskIndicator}</span>
                                </div>
                            </div>
                        </div>

                        <form className="contactRecordBox" onSubmit={handleEditContactNote}>
                            {/* <div className="messageSection">
                                <h3 className="sectionTitle smallTitle">Contact Message Sent</h3>
                                    <textarea defaultValue={contactData.message} name="message"></textarea>
                            </div> */}

                            <div className="noteSection">
                                <div className="noteType">
                                    <div className="noteSectionHeader">
                                        <h3 className="sectionTitle smallTitle">Note Type</h3>
                                    </div>
                                    
                                    {contactData.noteType ? (
                                        <>
                                            <select
                                                name="noteType"
                                                className="modal-select"
                                                defaultValue={contactData.noteType}
                                            >
                                                <option value="">-- Select note type -- </option>
                                                <option value="Meeting">Meeting</option>
                                                <option value="Follow Up">Follow-up</option>
                                                <option value="Observation">Observation</option>
                                            </select>
                                        </>
                                    ) : (
                                        <select
                                            name="noteType"
                                            className="modal-select"
                                            defaultValue={contactData.noteType}
                                        >
                                            <option value="">-- Select note type-- </option>
                                            <option value="meeting">Meeting</option>
                                            <option value="followup">Follow-up</option>
                                            <option value="observation">Observation</option>
                                        </select>
                                    )}
                                </div>
                                <div className="note">
                                    <div className="noteSectionHeader">
                                        <h3 className="sectionTitle smallTitle">Recorded Note</h3>
                                    </div>
                                    
                                    {contactData.note ? (
                                        <>
                                            <textarea defaultValue={contactData.note} name="note"></textarea>
                                        </>
                                    ) : (
                                        <textarea defaultValue="Add Note" name="note"></textarea>
                                    )}
                                </div>
                            </div>
                            <div className="buttonWrapper">
                                <button type="submit">Save Changes</button>
                            </div>
                        </form>
                    </article>
                </section>
            </main>
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
            <Footer />
        </>
    );
}

function SubHeader({ studentId }) {
    return (
        <>
            <aside className="studentInfoAsideWrapper">
                <NavLink
                    to={"/StudentInfo/" + studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader studentInfo" : "subButton"
                    }
                >
                    Student Information
                </NavLink>

                <NavLink
                    to={"/StudentInfoStatistic/" + studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader trendView" : "subButton"
                    }
                >
                    Trend View
                </NavLink>

                <NavLink
                    to={"/StudentContactHistory/" + studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader contactHistory" : "subButton"
                    }
                >
                    Contact History
                </NavLink>
            </aside>
        </>
    );
}

export default StudentContactView;