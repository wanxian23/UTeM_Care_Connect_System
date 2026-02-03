import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

import "./css/StudentInfo.css";
import {HeaderPa, Footer} from "./HeaderFooter";

function StudentInfo() {

    useEffect(() => {
        document.title = "Student Info";
    }, []);

    const [studentInfoData, setStudentInfoData] = useState(null);
    const [allData, setAllData] = useState(null);
    const [moodRecords, setMoodRecords] = useState([]);

    const { id } = useParams();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [stressLevel, setStressLevel] = useState("");
    const [stressColor, setStressColor] = useState("");
    
    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            window.location.href = "/";
            return;
        }

        fetch(`${process.env.REACT_APP_API_BASE_URL}/getStudentInfo.php?studentId=${id}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);
            
            if(data.success){
                setAllData(data || null);
                setStudentInfoData(data.studentData || null);
                setMoodRecords(data.studentMoodData || []);

                if (data.studentMoodData && data.studentMoodData.length > 0) {
                    calculateStress(data.studentMoodData[0].stressLevel);
                } else {
                    setStressLevel("No Record");
                    setStressColor("#ccc");
                }
            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, [id]);

    const calculateStress = (value) => {
        let level = "", color = "";
        if (value <= 20) { color = "#BFE5C8"; level = "Very Low Stress"; }
        else if (value <= 40) { color = "#d9f2dfff"; level = "Low Stress"; }
        else if (value <= 60) { color = "#e4b995ff"; level = "Moderate Stress"; }
        else if (value <= 80) { color = "#e9b6b6ff"; level = "High Stress"; }
        else { color = "#ee7878ff"; level = "Very High Stress"; }

        setStressLevel(level);
        setStressColor(color);
    }

    const goNext = () => {
        if(currentIndex < moodRecords.length - 1){
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            calculateStress(moodRecords[newIndex].stressLevel);
        }
    }

    const goPrev = () => {
        if(currentIndex > 0){
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            calculateStress(moodRecords[newIndex].stressLevel);
        }
    }

    const currentRecord = moodRecords[currentIndex] || null;

    const totalRecords = moodRecords.length;

    return(
        <>
            <HeaderPa />
            <StudentInfoContent 
                studentId={id}
                studentData={studentInfoData}
                allData={allData}
                currentRecord={currentRecord}  // Pass current record
                stressLevel={stressLevel} 
                stressColor={stressColor}
                onNext={goNext}
                onPrev={goPrev}
                currentIndex={currentIndex}
                totalRecords={moodRecords.length}
                disablePrev={currentIndex === 0 || totalRecords === 0}
                disableNext={currentIndex >= totalRecords - 1 || totalRecords === 0}
            />  
            {/* <Footer /> */}
        </>
    );
}

function SubHeader({studentId}) {

    return(
        <>
            {/* <main id="MoodRecordSubHeaderWrapper">
            <NavLink
                to={"/StudentInfo/"+studentId}
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader leftSelected" : "subButton"
                }
            >
            Student Information
            </NavLink>

            <NavLink
                to={"/StudentInfoStatistic/"+studentId}
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader rightSelected" : "subButton"
                }
            >
            Statistic
            </NavLink>
            </main> */}
            <aside className="studentInfoAsideWrapper">
                <NavLink
                    to={"/StudentInfo/"+studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader studentInfo" : "subButton"
                    }
                >
                Student Information
                </NavLink>

                <NavLink
                    to={"/StudentInfoStatistic/"+studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader trendView" : "subButton"
                    }
                >
                Trend View
                </NavLink>
                <NavLink
                    to={"/StudentContactHistory/"+studentId}
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

function StudentInfoContent({ 
    studentId,
    studentData, 
    allData,
    currentRecord, 
    stressLevel, 
    stressColor, 
    onNext, 
    onPrev, 
    currentIndex,
    totalRecords,
    disablePrev, 
    disableNext 
}) {  

    const [noteExpanded, setNoteExpanded] = useState(false);
    const noteRef = useRef(null);

    const toggleNote = () => {
        if (!noteExpanded) {
            // Expand
            gsap.to(noteRef.current, { height: "auto", duration: 0.5, opacity: 1 });
        } else {
            // Collapse
            gsap.to(noteRef.current, { height: 0, duration: 0.5, opacity: 0 });
        }
        setNoteExpanded(!noteExpanded);
    };
    
    if (!studentData) {
        return (
            <main className="studentInfoContentMain">
                <section className="studentInfoContentWrapper" style={{backgroundColor: "none"}}>
                    <div className="profileWrapper" style={{backgroundColor: "none", textAlign: "center"}}>
                        Loading...
                    </div>
                </section>
            </main>
        );
    }

    // Format to get date only (Without time)
    const dateOnly = new Date(studentData.studentMemberSince)
    .toISOString()
    .split("T")[0];

    let value = allData.todayStressLevel;
    let level = "", color = "";
    if (value <= 20) { color = "#BFE5C8"; level = "Very Low Stress"; }
    else if (value <= 40) { color = "#d9f2dfff"; level = "Low Stress"; }
    else if (value <= 60) { color = "#e4b995ff"; level = "Moderate Stress"; }
    else if (value <= 80) { color = "#e9b6b6ff"; level = "High Stress"; }
    else { color = "#ee7878ff"; level = "Very High Stress"; }

    return(
        <>  
            <main className="studentInfoContentMain">
                <SubHeader studentId={studentId}/>
                <section className="studentInfoContentWrapper">
                    <div className="profileWrapper">
                        <h2>Student Information</h2>
                        <div className="profileContentWrapper">
                            <div className="profileImg">{studentData.studentName[0]}</div>
                            <section className="personalInfoWrapper">
                                <aside>
                                    <label>Name:</label>
                                    <p>{studentData.studentName}</p>
                                </aside>
                                <aside>
                                    <label>Email:</label>
                                    <p>
                                        <a href={`mailto:${studentData.studentEmail}`}>{studentData.studentEmail}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                            </svg>
                                        </a>
                                    </p>
                                </aside>
                                <aside>
                                    <label>Contact:</label>
                                    <p>
                                        <a href={`https://wa.me/6${studentData.studentContact}`} target="_blank">{studentData.studentContact}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                            </svg>
                                        </a>
                                    </p>
                                </aside>
                                <aside>
                                    <label>Course:</label>
                                    <p>{studentData.studentCourse}</p>
                                </aside>
                                <aside>
                                    <label>Faculty:</label>
                                    <p>{studentData.studentFaculty}</p>
                                </aside>
                                <aside>
                                    <label>Section & Group:</label>
                                    <p>{studentData.studentSection} {studentData.studentGrp}</p>
                                </aside>
                                <aside>
                                    <label>Year Of Study:</label>
                                    <p>{studentData.studentYearOfStudy}</p>
                                </aside>
                                <aside>
                                    <label>Member Since:</label>
                                    <p>{dateOnly}</p>
                                </aside>
                            </section>
                        </div>
                    </div>

                    {/* <div className="separateWrapper">
                        <div className="profileWrapper">
                            <h2>Today Mood Records</h2>
                            <div className="profileContentWrapper">
                                <section className="personalInfoWrapper">
                                    <aside>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16" 
                                        onClick={onPrev} disabled={disablePrev} style={{ cursor: disablePrev ? "not-allowed" : "pointer", opacity: disablePrev ? 0.5 : 1 }}>
                                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                        </svg>

                                        <h3>Record {currentIndex + 1} of {totalRecords}</h3>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16" 
                                        onClick={onNext} disabled={disableNext} style={{ cursor: disableNext ? "not-allowed" : "pointer", opacity: disableNext ? 0.5 : 1 }}>
                                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                        </svg>
                                    </aside>
                                    {currentRecord ? (
                                        <>
                                            <aside>
                                                <label className="sectionTitle">Mood</label>
                                                <div>
                                                    <img src={currentRecord.moodStoreLocation} alt={currentRecord.moodStatus} />
                                                    <p>{currentRecord.moodStatus}</p>
                                                </div>
                                            </aside>
                                            <aside>
                                                <label className="sectionTitle">Stress Level</label>
                                                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "10px 0 0 0", gap: "10px"}}>
                                                    <p style={{ backgroundColor: stressColor, width: "60px", height: "60px", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>{currentRecord.stressLevel}%</p>
                                                    <p>{stressLevel}</p>
                                                </div>
                                            </aside>
                                            <aside>
                                                <label className="sectionTitle">Time Record</label>
                                                <p style={{margin: "25px 0 0 0"}}>{new Date(currentRecord.moodRecordTime).toLocaleDateString()}</p>
                                                <p>{new Date(currentRecord.moodRecordTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

                                            </aside>
                                            <aside>
                                                <label className="sectionTitle">Stress Factors</label>
                                                <div className="stressorWrapper">
                                                    {currentRecord.entriesData.length > 0 ?
                                                        <>
                                                        {currentRecord.entriesData.map((entry, idx) => (
                                                            <span key={idx}>{entry.entriesType}</span>
                                                        ))}
                                                        </>
                                                    :
                                                        "No Record"
                                                    }
                                                </div>
                                            </aside>
                                            <aside>
                                                <label className="sectionTitle"
                                                    style={{marginBottom: "10px"}}
                                                >Note</label>
                                                {currentRecord.notePrivacy == 0 ? (
                                                    <>
                                                        <div
                                                            className="expandWrapper"
                                                            onClick={toggleNote}
                                                            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                                        >
                                                        
                                                        {noteExpanded ? 
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                                                </svg>
                                                                <h4>{noteExpanded ? "Collapse Note" : "Expand To View Note"}</h4>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                                                </svg>
                                                            </>
                                                        :
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                                                </svg>
                                                                <h4>{noteExpanded ? "Collapse Note" : "Expand To View Note"}</h4>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                                                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                                                </svg>
                                                            </>
                                                        }
                                                        </div>

                                                        <div
                                                            ref={noteRef}
                                                            style={{
                                                                height: 0,
                                                                overflow: "hidden",
                                                                opacity: 0,
                                                                marginTop: "10px",
                                                                textAlign: "justify",
                                                                lineHeight: "30px"
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: currentRecord.note }}
                                                        ></div>
                                                    </>
                                                ) : (
                                                    <p>Note cannot be shown due to personal privacy!</p>
                                                )}
                                            </aside>
                                        </>
                                    ) : (
                                        <p>No mood records for today</p>
                                    )}
                                </section>
                            </div>
                        </div>

                        <div className="profileWrapper">
                            <h2>Today Mood Summary</h2>
                            <div className="profileContentWrapper">
                                <section className="moodSummarySectionWrapper">
                                    {allData.moodStatus[0] ? 
                                        <>
                                            <aside className="todayMoodSummaryAside">
                                                <label className="sectionTitle">Mood Changes Today:</label>
                                                <div className="avgMoodWrapper">
                                                    <div>
                                                        <img src={allData.moodStoreLocation[0]}></img>
                                                        <p>{allData.moodStatus[0]}</p>
                                                    </div>
                                                    <div>
                                                        <p className="moodChangeLabel">Mood Changes</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        {allData.moodStoreLocation[1] ? 
                                                            <>
                                                                <img src={allData.moodStoreLocation[1]}></img>
                                                                <p>{allData.moodStatus[1]}</p>
                                                            </>
                                                        :
                                                            <p>No Record</p>
                                                        }
                                                    </div>
                                                </div>
                                            </aside>
                                            <aside className="todayMoodSummaryAside">
                                                <label className="sectionTitle">Average Stress Level:</label>
                                                <p style={{backgroundColor: color, width: "60px", height: "60px" , borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                                    {allData.todayStressLevel}%
                                                </p>
                                                <p>{level}</p>
                                            </aside>  
                                        </>   
                                    :
                                        <p>No mood records for today</p>
                                    }
                                </section>
                            </div>
                        </div>
                    </div> */}
                </section>
            </main>
        </>
    );
}

export default StudentInfo;