import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeaderPa, Footer } from "./HeaderFooter";
import { NavLink } from "react-router-dom";
import MessageBox, { ConfirmationModal } from "./Modal";

import "./css/StudentContactView.css";

function StudentContactView() {
    useEffect(() => {
        document.title = "Contact Details";
    }, []);

    const [contactData, setContactData] = useState(null);
    const [profileData, setProfileData] = useState(null);
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

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/";
            return;
        }

        fetch(`${process.env.REACT_APP_API_BASE_URL}/getStudentContactCalendarDetails.php?studentId=${studentId}&selectedDate=${date}`, {
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

                setProfileData(data.profileData);
                
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

    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
        if (shouldRedirect) {
            window.location.href = `/StudentContactView/${studentId}/${date}`;
        }
    };

    const handlePushToCounsellor = async (student) => {
        setConfirmationBox({
            show: true,
            title: "Push Contact & Note To Counsellor?",
            message: "Are you sure you wanna push this contact & note details to counsellor as reference? This action cannot be undone.",
            confirmText: "Push",
            cancelText: "Cancel",
            onConfirm: async () => {
                setConfirmationBox(prev => ({ ...prev, show: false }));

                const token = localStorage.getItem("token");

                try {
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/pushNoteToCounsellor.php?contactId=${contactData.contactId}&date=${date}`, {
                            method: "GET",
                            headers: { "Authorization": "Bearer " + token }
                        }
                    );

                    const result = await response.json();
                        setMessagebox({
                            show: true,
                            title: result.success ? "Contact & Note Pushed Successfully" : "Contact & Note Failed to Push",
                            message: result.success
                                ? `This contact & note details has successfully pushed to counselling unit.`
                                : `Failed to push contact & note details to counselling unit.`,
                            buttonValue: "OK",
                            redirect: true
                        });

                } catch (error) {
                    console.error(error);
                    setMessagebox({
                        show: true,
                        title: "Contact & Note Failed to Push",
                        message: `Failed to push contact & note details to counselling unit due to error.`,
                        buttonValue: "OK",
                        redirect: false
                    });
                }
            },
            onCancel: () =>
                setConfirmationBox(prev => ({ ...prev, show: false }))
        });
    };


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

    const gotoEditNote = () => {
        navigate(`/EditContactNote/${studentId}/${date}`);
    }

    const getArrowIcon = (trend) => {
        if (trend === 'increasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                    <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                </svg>
            );
        } else if (trend === 'decreasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash" viewBox="0 0 16 16">
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                </svg>
            );
        }
    };

    const getTrendColor = (category, trend) => {
        if (category === 'positive') {
            return trend === 'increasing' ? '#4CAF50' : trend === 'decreasing' ? '#ff1111' : '#757575';
        } else if (category === 'negative') {
            return trend === 'decreasing' ? '#4CAF50' : trend === 'increasing' ? '#ff1111' : '#757575';
        }
        return '#757575';
    };

    const getOverallMessage = () => {
        // Check if monthlyComparison and mood exist
        if (!trendData.monthlyComparison?.mood) {
            return { text: 'No data', color: '#757575' };
        }
        
        const { overallTrend } = trendData.monthlyComparison.mood;
        
        if (overallTrend === 'improving') {
            return { text: 'Positive improvement', color: '#4CAF50' };
        } else if (overallTrend === 'declining') {
            return { text: 'Mood balance changed', color: '#ff1111' };
        }
        return { text: 'Remains stable', color: '#2196F3' };
    };

    const getStressColor = (value) => {
        if (value <= 20) return "#BFE5C8";
        if (value <= 40) return "#d9f2dfff";
        if (value <= 60) return "#e4b995ff";
        if (value <= 80) return "#e9b6b6ff";
        return "#ee7878ff";
    };

    const getStressArrowIcon = (trend) => {
        if (trend === 'increasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
                </svg>
            );
        } else if (trend === 'decreasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
            );
        }
    };

    const getInterpretationMessage = () => {
        // Check if monthlyComparison and stress exist
        if (!trendData.monthlyComparison?.stress) {
            return { 
                text: 'No stress data available',
                color: '#757575'
            };
        }
        
        const interpretation = trendData.monthlyComparison?.stress?.overallTrend;
        
        if (interpretation === 'improving') {
            return {
                text: 'Moderate improvement',
                color: '#4CAF50'
            };
        } else if (interpretation === 'worsening') { 
            return { 
                text: 'Significant increase',
                color: '#F44336'
            };
        } else {
            return {
                text: 'Stable',
                color: '#4CAF50'
            };
        }

    };

    const getRiskIndicator = () => {
        // Default values if data doesn't exist
        const trendMood = trendData.monthlyComparison?.mood?.positive?.trend;
        const trendStress = trendData.monthlyComparison?.stress?.high?.trend;

        // If no data, return low risk
        if (!trendMood && !trendStress) {
            return {
                text: "No Data",
                color: "#757575"
            };
        }

        if (trendMood === "decreasing" && trendStress === "increasing") {
            return {
                text: "High",
                color: "#F44336"
            };
        } else if (trendMood === "decreasing" || trendStress === "increasing") {
            return {
                text: "Moderate",
                color: "#f49e36ff"
            };
        } else {
            return {
                text: "Low",
                color: "#4CAF50"
            };
        }
    };

    // ✅ CALCULATE ALL VARIABLES HERE with null-safe access
    const overallMessage = getOverallMessage();
    const message = getInterpretationMessage();
    
    // ✅ Safe access with default values
    const trend = trendData.monthlyComparison?.stress?.trend || 'stable';
    const difference = trendData.monthlyComparison?.stress?.difference ?? 0;
    const percentChange = trendData.monthlyComparison?.stress?.percentChange ?? 0;
    const trendColor = trend === 'decreasing' ? '#4CAF50' : trend === 'increasing' ? '#F44336' : '#757575';

    const lowStressData = trendData.monthlyComparison?.stress?.low;
    const moderateStressData = trendData.monthlyComparison?.stress?.moderate;
    const highStressData = trendData.monthlyComparison?.stress?.high;

    const trendLow = lowStressData?.trend || 'stable';
    const trendColorLow = trendLow === 'increasing' ? '#4CAF50' : trendLow === 'decreasing' ? '#F44336' : '#757575';
    const differenceLow = lowStressData?.difference || 0;

    const trendModerate = moderateStressData?.trend || 'stable';
    const trendColorModerate = trendModerate === 'increasing' ? '#4CAF50' : trendModerate === 'decreasing' ? '#F44336' : '#757575';
    const differenceModerate = moderateStressData?.difference || 0;

    const trendHigh = highStressData?.trend || 'stable';
    const trendColorHigh = trendHigh === 'decreasing' ? '#4CAF50' : trendHigh === 'increasing' ? '#F44336' : '#757575';
    const differenceHigh = highStressData?.difference || 0;

    const getDassLevelColor = (level) => {
        if (!level) return "#ffffff";
        if (level == "Normal") {
            return "#BFE5C8"
        } else if (level == "Mild") {
            return "#e4e8ccff"
        } else if (level == "Moderate") {
            return "#e4b995ff"
        } else if (level == "Severe") {
            return "#ff3a3a"
        } else if (level == "Extremely Severe") {
            return "#ff3a3a"
        }
    }
    
    return (
        <>
            <HeaderPa />
            <main className="studentInfoContentMain">
                <SubHeader studentId={studentId} />
                <section className="studentInfoContentWrapper">
                    <article className="contactInfoWrapper">
                        <div className="contactHeader">
                            <h1 className="sectionTitle">Contact Details</h1>
                        </div>
                        <div className="contactDateTimeWrapper">
                            <h2>{formatDay(date)}</h2>
                            <h2>{formatDate(date)}</h2>
                            <h2>{formatTime(contactData.datetimeRecord)}</h2>
                        </div>

                        <div className="studentInfoBox">
                            <h3 className="sectionTitle smallTitle" style={{
                                fontSize: "3vh"
                            }}>Person Involved</h3>
                            <div className="infoGrid" style={{
                                flexDirection: "row",
                                alignItems: "center",
                                
                            }}>
                                <div className="infoItem" style={{flex: "30%"}}>
                                    <h4 className="infoLabel">{profileData.staffName}</h4>
                                </div>
                                <div className="infoItem" style={{flex: "30%"}}>
                                    <label>Contact</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                    </svg>
                                </div>
                                <div className="infoItem" style={{flex: "30%"}}>
                                    <h4 className="infoLabel">{studentData.studentName}</h4>
                                </div>
                            </div>
                        </div>

                        {!trendData.dassContact ?
                            <div className="studentInfoBox">
                                <h3 className="sectionTitle smallTitle" style={{
                                    fontSize: "3vh"
                                }}>Mood Condition Monthly Changes</h3>
                                <div className="infoGrid">
                                    <div className="infoItem">
                                        <h4 className="infoLabel">Timeline</h4>
                                        <span className="infoValue">{trendData.monthlyComparison?.period?.lastMonth} - {trendData.monthlyComparison?.period?.thisMonth}</span>
                                    </div>
                                    <div className="infoItem">
                                        <h4 className="infoLabel">Mood Changes</h4>
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: "center",
                                                gap: "10px"
                                            }}
                                        >
                                            {/* Positive */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                textWrap: "nowrap",
                                                gap: "5px 10px",
                                                backgroundColor: "#BFE5C8",
                                                borderRadius: "10px",
                                                padding: "5px",
                                                border: "1px solid" + getTrendColor(
                                                    'positive',
                                                    trendData.monthlyComparison?.mood?.positive?.trend
                                                ),
                                                color: getTrendColor(
                                                    'positive',
                                                    trendData.monthlyComparison?.mood?.positive?.trend
                                                )
                                            }}>
                                                Pos (+): {getArrowIcon(trendData.monthlyComparison?.mood?.positive?.trend)}
                                                {Math.abs(trendData.monthlyComparison?.mood?.positive?.difference ?? 0)}%
                                            </div>

                                            {/* Negative */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                textWrap: "nowrap",
                                                gap: "5px 10px",
                                                backgroundColor: "#fac7c7ff",
                                                borderRadius: "10px",
                                                padding: "5px",
                                                border: "1px solid" + getTrendColor(
                                                    'negative',
                                                    trendData.monthlyComparison?.mood?.negative?.trend
                                                ),
                                                color: getTrendColor(
                                                    'negative',
                                                    trendData.monthlyComparison?.mood?.negative?.trend
                                                )
                                            }}>
                                                Neg (-): {getArrowIcon(trendData.monthlyComparison?.mood?.negative?.trend)}
                                                {Math.abs(trendData.monthlyComparison?.mood?.negative?.difference ?? 0)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="infoItem">
                                        <h4 className="infoLabel">Mood Summary</h4>
                                        <span className="infoValue"
                                            style={{
                                                color: overallMessage.color
                                            }}
                                        >
                                            {overallMessage.text}
                                        </span>
                                    </div>
                                    <div className="infoItem">
                                        <h4 className="infoLabel">Stress Changes</h4>
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: "center",
                                                gap: "10px"
                                            }}
                                        >
                                            {/* Low */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                textWrap: "nowrap",
                                                gap: "5px 10px",
                                                backgroundColor: "#BFE5C8",
                                                borderRadius: "10px",
                                                padding: "5px",
                                                border: "1px solid" + trendColorLow,
                                                color: trendColorLow
                                            }}>
                                                Low: {getStressArrowIcon(trendData.monthlyComparison?.stress?.low?.trend)}
                                                {Math.abs(trendData.monthlyComparison?.stress?.low?.difference ?? 0)}%
                                            </div>

                                            {/* High */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                textWrap: "nowrap",
                                                gap: "5px 10px",
                                                backgroundColor: "#fac7c7ff",
                                                borderRadius: "10px",
                                                padding: "5px",
                                                border: "1px solid" + trendColorHigh,
                                                color: trendColorHigh
                                            }}>
                                                High: {getStressArrowIcon(trendData.monthlyComparison?.stress?.high?.trend)}
                                                {Math.abs(trendData.monthlyComparison?.stress?.high?.difference ?? 0)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="infoItem">
                                        <h4 className="infoLabel">Stress Summary</h4>
                                        <span className="infoValue"
                                            style={{
                                                color: message.color
                                            }}
                                        >{message.text}</span>
                                    </div>
                                </div>
                            </div>
                        :
                            <div className="studentInfoBox">
                                <h3 className="sectionTitle smallTitle" style={{
                                    fontSize: "3vh"
                                }}>DASS Condition</h3>
                                <div className="infoGrid">
                                    <div className="infoItem"
                                        style={{
                                            flex: "45%"
                                        }}
                                    >
                                        <h4 className="infoLabel">DASS Creation Date</h4>
                                        <span className="infoValue">{trendData.creationDate}</span>
                                    </div>
                                    <div className="infoItem"
                                        style={{
                                            flex: "45%"
                                        }}
                                    >
                                        <h4 className="infoLabel">DASS Completed Date</h4>
                                        <span className="infoValue">{trendData.completedDate}</span>
                                    </div>
                                    <div className="infoItem"
                                        style={{
                                            flex: "30%"
                                        }}
                                    >
                                        <h4 className="infoLabel">Depression Level</h4>
                                        <div
                                            style={{
                                                padding: "5px 20px",
                                                borderRadius: "5px",
                                                backgroundColor: getDassLevelColor(trendData.depressionLevel)
                                            }} 
                                        >
                                            {trendData.depressionLevel}
                                        </div>
                                    </div>
                                    <div className="infoItem"
                                        style={{
                                            flex: "30%"
                                        }}
                                    >
                                        <h4 className="infoLabel">Anxiety Level</h4>
                                        <div
                                            style={{
                                                padding: "5px 20px",
                                                borderRadius: "5px",
                                                backgroundColor: getDassLevelColor(trendData.anxietyLevel)
                                            }} 
                                        >
                                            {trendData.anxietyLevel}
                                        </div>
                                    </div>
                                    <div className="infoItem"
                                        style={{
                                            flex: "30%"
                                        }}
                                    >
                                        <h4 className="infoLabel">Stress Level</h4>
                                        <div
                                            style={{
                                                padding: "5px 20px",
                                                borderRadius: "5px",
                                                backgroundColor: getDassLevelColor(trendData.stressLevel)
                                            }} 
                                        >
                                            {trendData.stressLevel}
                                        </div>
                                    </div>
                                   
                                </div>
                            </div>
                        }

                        <div className="contactRecordBox">
                            {/* <div className="messageSection">
                                <h3 className="sectionTitle smallTitle" style={{
                                fontSize: "3vh"
                            }}>Contact Message Sent</h3>
                                <div className="messageContent">
                                    {contactData.message || "No message recorded"}
                                </div>
                            </div> */}

                            <div className="noteSection">
                                <div className="noteType">
                                    <div className="noteSectionHeader">
                                        <h3 className="sectionTitle smallTitle" style={{
                                fontSize: "3vh"
                            }}>Note Type</h3>
                                        <span className={`noteStatusBadge ${contactData.noteStatus}`}>
                                            {contactData.noteStatus}
                                        </span>
                                    </div>
                                    
                                    {contactData.noteType ? (
                                        <>
                                            <div className="noNoteMessage">
                                                {contactData.noteType}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="noNoteMessage">
                                            No note type added.
                                        </div>
                                    )}
                                </div>
                                <div className="note">
                                    <div className="noteSectionHeader">
                                        <h3 className="sectionTitle smallTitle" style={{
                                fontSize: "3vh"
                            }}>Recorded Note</h3>
                                    </div>
                                    
                                    {contactData.note ? (
                                        <>
                                            <div className="infoGrid">
                                                <div className="noteContent">
                                                    {contactData.note}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="noNoteMessage">
                                            No note has been added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                            }}
                        >
                            <div className="buttonWrapper">
                                <button onClick={gotoEditNote}>Edit</button>
                            </div>
                            {contactData.note && !contactData.pushToCounsellor && 
                                <div className="buttonWrapper">
                                    <button onClick={handlePushToCounsellor}>Refer To Counsellor</button>
                                </div>
                            } 
                        </div>
                    </article>
                </section>
            </main>
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