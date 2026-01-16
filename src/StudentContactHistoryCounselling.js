import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { NavLink } from "react-router-dom";
import "react-calendar/dist/Calendar.css";

import "./css/calendar.css";
import { HeaderCounsellor, Footer } from "./HeaderFooter";
import { SubHeader } from "./StudentInfoCounselling";

function StudentContactHistory() {
    useEffect(() => {
        document.title = "Contact History";
    }, []);

    const [studentInfoData, setStudentInfoData] = useState(null);
    const [contactsByDate, setContactsByDate] = useState({});
    const [loading, setLoading] = useState(true);

    const { studentId, paId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/";
            return;
        }

        fetch(`http://localhost:8080/care_connect_system/backend/api/getStudentContactHistory.php?studentId=${studentId}&paId=${paId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("CONTACT HISTORY RESPONSE:", data);
            
            if (data.success) {
                setStudentInfoData(data.studentData || null);
                setContactsByDate(data.contactsByDate || {});
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
    }, [studentId]);

    return (
        <>
            <HeaderCounsellor />
            {loading ? (
                <main className="studentInfoContentMain">
                    <section className="studentInfoContentWrapper">
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            Loading...
                        </div>
                    </section>
                </main>
            ) : (
                <ContactHistoryCalendar 
                    paId={paId}
                    studentId={studentId}
                    studentData={studentInfoData}
                    contactsByDate={contactsByDate}
                />
            )}
            <Footer />
        </>
    );
}

function ContactHistoryCalendar({ paId, studentId, studentData, contactsByDate }) {
    const navigate = useNavigate();

    if (!studentData) {
        return (
            <main className="studentInfoContentMain">
                <section className="studentInfoContentWrapper">
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        Student data not available
                    </div>
                </section>
            </main>
        );
    }

    // Get list of dates with contacts
    const contactDates = Object.keys(contactsByDate);

    return (
        <>
            <main className="studentInfoContentMain">
                <SubHeader paId={paId} studentId={studentId} />
                <section className="studentInfoContentWrapper">
                    <div className="studentProfileSection">
                        <h2>{studentData.studentName}</h2>
                        <p>{studentData.matricNo}</p>
                        <p style={{ marginTop: "10px", fontSize: "2.3vh", color: "#666" }}>
                            Click on a date with contact records to view details
                        </p>
                    </div>

                    <main id="mainCalendarFirst" style={{background:"none", paddingBottom: "0"}}>
                        <Calendar
                            className="customCalendar contact"
                            
                            // Handle date click
                            onClickDay={(value) => {
                                const clickedDate = value.getFullYear() + '-' +
                                    String(value.getMonth() + 1).padStart(2, '0') + '-' +
                                    String(value.getDate()).padStart(2, '0');

                                // Only navigate if there's a contact record for this date
                                if (contactsByDate[clickedDate]) {
                                    navigate(`/StudentContactViewCounselling/${studentId}/${paId}/${clickedDate}`);
                                }
                            }}

                            // Add custom content to tiles
                            tileContent={({ date, view }) => {
                                if (view !== "month") return null;

                                const dateString = date.getFullYear() + '-' +
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                                    String(date.getDate()).padStart(2, '0');

                                // Check if there's a contact for this date
                                if (!contactsByDate[dateString]) return null;

                                const contacts = contactsByDate[dateString];
                                const latestContact = contacts[0]; // Get the most recent contact

                                if (!latestContact.note) {
                                    return (
                                        <>
                                            <div className="titleContent">
                                                {latestContact.pushToCounsellor && 
                                                    <div className="noteStatus"
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "row"
                                                        }}
                                                    >
                                                        <span className="statusLabel">Pushed: </span>
                                                        <span className="noteContent">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                                                                <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                                                                <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                }
                                                <div className="noteStatus">
                                                    <span className="statusLabel">Note:</span>
                                                        <span className="noteContent"
                                                            style={{
                                                                color: "#de782fff"
                                                            }}
                                                        >
                                                            PENDING TO ADD
                                                        </span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                }
                                
                                return (
                                    <>
                                        {/* <div className="titleContent">
                                            <div className="contactStatus">
                                                <span className="statusLabel">Contact:</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                </svg>
                                            </div>
                                        </div> */}
                                        <div className="titleContent">
                                            {latestContact.pushToCounsellor == 1 && 
                                                <div className="noteStatus"
                                                    style={{
                                                            display: "flex",
                                                            flexDirection: "row"
                                                        }}
                                                >
                                                    <span className="statusLabel">Pushed: </span>
                                                    <span className="noteContent">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                                                            <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                                                            <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                                                        </svg>
                                                    </span>
                                                </div>
                                            }
                                            <div className="noteStatus">
                                                <span className="statusLabel">Note:</span>
                                                <span className="noteContent">
                                                    {latestContact.note.length > 20
                                                        ? 
                                                        <>
                                                            {latestContact.note.slice(0, 15)}
                                                            <label style={{color: "blue", fontSize: "2vh"}}> ...read more</label>
                                                        </>
                                                        : latestContact.note
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            }}

                            // Highlight tiles with contacts
                            tileClassName={({ date, view }) => {
                                if (view !== "month") return null;

                                const dateString = date.getFullYear() + '-' +
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                                    String(date.getDate()).padStart(2, '0');

                                if (contactsByDate[dateString]) {
                                    return 'has-contact';
                                }
                                return null;
                            }}
                        />
                    </main>

                    <div className="contactSummary">
                        <h3>Contact Summary</h3>
                        <div className="summaryStats">
                            <div className="statBox">
                                <span className="statLabel">Total Contacts:</span>
                                <span className="statValue">{contactDates.length}</span>
                            </div>
                            <div className="statBox">
                                <span className="statLabel">Notes Added:</span>
                                <span className="statValue">
                                    {contactDates.filter(date => 
                                        contactsByDate[date].some(c => c.noteStatus === "Added")
                                    ).length}
                                </span>
                            </div>
                            <div className="statBox">
                                <span className="statLabel">Notes Pending:</span>
                                <span className="statValue">
                                    {contactDates.filter(date => 
                                        contactsByDate[date].every(c => c.noteStatus === "Pending")
                                    ).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default StudentContactHistory;