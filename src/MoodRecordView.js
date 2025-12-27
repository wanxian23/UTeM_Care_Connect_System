import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {Header, Footer} from "./HeaderFooter";
import {SubHeader} from "./MoodRecord";
import { Link } from "react-router-dom";

import "./css/MoodRecordView.css";

// Cannot import both inside {} cuz {} is only for external function
// For default function then outside {}
import MessageBox, { ConfirmationModal } from "./Modal";

function MoodRecordEntries() {

    useEffect(() => {
        document.title = "Mood Record View";
    }, []);

    const [moodRecords, setMoodRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stressLevel, setStressLevel] = useState("");
    const [stressColor, setStressColor] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){ window.location.href = "/"; return; }

        fetch("http://localhost:8080/care_connect_system/backend/api/getMoodRecordView.php", {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);

            if(data.success && data.records && data.records.length > 0){
                setMoodRecords(data.records);
                calculateStress(data.records[0].stressLevel);
            }
        })
        .catch(err => console.error(err));
    }, []);

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

    return (
        <>
            <Header />
            <SubHeader />
            <Body1 
                data={currentRecord} 
                stressLevel={stressLevel} 
                stressColor={stressColor}
                onNext={goNext}
                onPrev={goPrev}
                disablePrev={currentIndex === 0}
                disableNext={currentIndex === moodRecords.length - 1}
                currentRecord={currentRecord}
            />
            <Footer />
        </>
    );
}


function Body1({data, stressLevel, stressColor, onNext, onPrev, disableNext, disablePrev, currentRecord}) {
    
    const navigate = useNavigate();

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

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

    // Showing today date
    const today = new Date();

    const formattedDateToday = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }); 

    const weekDay = today.toLocaleDateString("en-GB", {
        weekday: "long"
    });

    // Showing realtime
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
        setTime(new Date()); // update every second
        }, 1000);

        return () => clearInterval(timer); // cleanup when component unmounts
    }, []);

    const formattedTime = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    // en-GB format the order of the date (Follow day, month, and year)
    // Suppose data.moodRecordTime = "2025-12-01 10:30:00"
    // Safe formatting for mood record date (Avoid null)
    let formattedTimeBasedOnRecord = "No record";
    if (data?.moodRecordTime) {
        const moodDate = new Date(data.moodRecordTime);
        if (!isNaN(moodDate)) {
            formattedTimeBasedOnRecord = moodDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    }

    // For messageBox
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = "/MoodRecordView";
        }
    };

    const goToEditMoodRecord = (id) => {
        navigate(`/EditMoodRecord/${id}/Today`);
    };

    const openDeleteModal = () => {
        setConfirmationBox({
            show: true,
            title: "Delete Mood Record?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                setConfirmationBox(prev => ({ ...prev, show: false }));

                const token = localStorage.getItem("token");

                try {
                    const response = await fetch(
                        `http://localhost:8080/care_connect_system/backend/api/deleteMoodRecord.php?moodId=${currentRecord?.moodId}&date=today`,
                        {
                            method: "GET", // match PHP
                            headers: { "Authorization": "Bearer " + token }
                        }
                    );

                    const result = await response.json(); // make sure PHP only outputs JSON

                    if (result.success) {
                        setMessagebox({
                            show: true,
                            title: "Mood Record Deleted Successfully",
                            message: result.message,
                            buttonValue: "OK",
                            redirect: true
                        });
                    } else {
                        setMessagebox({
                            show: true,
                            title: "Mood Record Delete Failed",
                            message: result.message,
                            buttonValue: "OK",
                            redirect: true
                        });
                    }
                } catch (error) {
                    console.error(error);
                    setMessagebox({
                        show: true,
                        title: "Mood Record Delete Failed",
                        message: "Error occurred while deleting.",
                        buttonValue: "OK",
                        redirect: true
                    });
                }
            },
            onCancel: () =>
                setConfirmationBox(prev => ({ ...prev, show: false }))
        });
    };


    // In JSX, return and ( must at the same line (Next line will get ignore)
    if (!data) return (
        <main className="bodyMoodRecordViewFirst">
            <article className="moodRecordInfoWrapper">
                <div className="moodRecordEachInfoWrapper">
                    <h2>{weekDay}</h2>
                    <h2>{formattedDateToday}</h2>
                    <h2>{formattedTime}</h2>
                </div>
                <div className="moodRecordEachInfoWrapper">
                    <p>You Haven't Record For Today Mood!</p>
                </div>
            </article>
        </main>
    );

    return(
        <>
            <main className="bodyMoodRecordViewFirst">
                <div className="actionWrapper">
                    <button onClick={() => {goToEditMoodRecord(currentRecord?.moodId)}}>Edit Mood</button>
                    <button onClick={openDeleteModal}>Delete Mood</button>
                </div>
                <article className="moodRecordInfoWrapper">
                    <div className="moodRecordEachInfoWrapper">
                        <svg 
                            onClick={onPrev} 
                            style={{ cursor: disablePrev ? "not-allowed" : "pointer", opacity: disablePrev ? 0.5 : 1 }}
                            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                            className="bi bi-chevron-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                        </svg>

                        <h2>{weekDay}</h2>
                        <h2>{formattedDateToday}</h2>
                        <h2>{formattedTimeBasedOnRecord}</h2>
                        
                        <svg 
                            onClick={onNext} 
                            style={{ cursor: disableNext ? "not-allowed" : "pointer", opacity: disableNext ? 0.5 : 1 }}
                            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                            className="bi bi-chevron-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </div>
                    <div className="moodRecordEachInfoWrapper">
                        <section>
                            <h3 className="sectionTitle">Today Mood</h3>
                            <div className="moodResultWrapper">
                                <img src={data.moodStoreLocation}></img>
                                <h3>{data.moodStatus}</h3>
                            </div>
                        </section>
                        <section>
                            <h3 className="sectionTitle">Stress Level</h3>
                            <div className="moodResultWrapper">
                                <div className="stressIcon"
                                     style={{
                                        backgroundColor: `${stressColor}`
                                     }}><h2>{data.stressLevel}%</h2></div>
                                <h3>{stressLevel}</h3>
                            </div> 
                        </section>
                    </div>
                    <div className="moodRecordEachInfoWrapper">
                        <section>
                            <h3 className="sectionTitle">Reason That Cause Stress</h3>
                             <div className="moodResultWrapper">
                            {data.entriesData.map((entry, index) => (
                                <div key={index} className="entriesIconWrapper">
                                    {/* <img src={entry.entriesStoreLocation} alt={entry.entry} /> */}
                                    <h3 className="entryLabel">{entry.entriesType}</h3>                                    
                                </div>
                            ))}
                            </div>
                        </section>
                    </div>
                    <div className="moodRecordEachInfoWrapper">
                        <section>
                            <h3 className="sectionTitle">Note About Today</h3>
                            <div className="moodResultWrapper">
                                <p dangerouslySetInnerHTML={{ __html: data.note }} />
                            </div>
                        </section>
                    </div>
                </article>
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
            </main>
        </>
    );
}


export default MoodRecordEntries;