import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import {Header, Footer} from "./HeaderFooter";
import { NavLink } from "react-router-dom";
import MessageBox from "./Modal";

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import "./css/calendar.css";


function Calender() {

    useEffect(() => {
        document.title = "Calendar";
    }, []);

    const [calendarData, setCalendarData] = useState(null);

     useEffect(() => {
         const token = localStorage.getItem("token");
 
         if(!token){
             // No token, redirect to login
             window.location.href = "/";
             return;
         }
 
         fetch("http://localhost:8080/care_connect_system/backend/api/getCalendar.php", {
             method: "GET",
             headers: {
                 "Authorization": "Bearer " + token
             }
         })
         .then(res => res.json())
         .then(data => {
             console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
             
             if(data.success){
                 setCalendarData(data);
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
            <Header />
            <DateShow />
            <CalendarDesign data={calendarData} />
            <MoodCount data={calendarData}/>
            <Footer />
        </>
    );
}

function DateShow() {
    const navigate = useNavigate();

    const clickToMoodRecord = () => {   
        navigate("../MoodRecord");
    };

    // Showing today date
    const today = new Date();
    // en-GB format the order of the date (Follow day, month, and year)
    const formattedDate = today.toLocaleDateString("en-GB", {
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

    return(
        <>
            <main id="bodyCalendarFirst">
                <article id="moodRecordInfoWrapper">
                    {/* <img src={teacherIcon}></img>
                    <div id="dashboardTeacherDialogWrapper">
                        <h2>You Seem Like Haven't Record Any Feelings Today Yet!</h2>
                        <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                    </div> */}
                    <div id="dashboardMoodDateWrapper">
                        <div>
                            <h2>{weekDay}</h2>
                            <h2>{formattedDate}</h2>
                            <h2>{formattedTime}</h2>
                        </div>
                    </div>
                </article>
            </main>
        </>
    );
}

function CalendarDesign({ data }) {

    const navigate = useNavigate();

    if (!data || !data.dailyMood) {
        return (
            <main id="mainCalendarFirst">
                Loading....
            </main>
        );
    }

    const dailyDates = Object.keys(data.dailyMood);
    
    return (
        <main id="mainCalendarFirst">
            <Calendar
                className="customCalendar"

                // ✅ Handle date click
                onClickDay={(value) => {
                    const clickedDate = value.getFullYear() + '-' +
                                        String(value.getMonth() + 1).padStart(2, '0') + '-' +
                                        String(value.getDate()).padStart(2, '0');

                    navigate(`/CalendarMoodRecordView/${clickedDate}`);
                }}

                tileContent={({ date, view }) => {
                    if (view !== "month") return null;

                    const dateString = date.getFullYear() + '-' +
                                       String(date.getMonth() + 1).padStart(2, '0') + '-' +
                                       String(date.getDate()).padStart(2, '0');

                    if (!dailyDates.includes(dateString)) return null;

                    const moodList = data.dailyMood[dateString];
                    const avgStress = data.avgStressLevel[dateString]; // ← use this

                    return (
                        <>
                            <div className="titleContent">
                                {moodList.map((mood, i) => (
                                    <React.Fragment key={i}>
                                    <img
                                        src={mood.moodStoreLocation}
                                        alt={mood.moodStatus}
                                    />
                                    {/* Add arrow if not the last mood */}
                                    {i < moodList.length - 1 && (
                                        <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        className="bi bi-arrow-right"
                                        viewBox="0 0 16 16"
                                        >
                                        <path
                                            fillRule="evenodd"
                                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                                        />
                                        </svg>
                                    )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="titleContent">
                                <h4>Avg Stress: <label>{avgStress ? avgStress + "%" : "N/A"}</label></h4> {/* ← correct */}
                            </div>
                            <div className="titleContent">
                                <h4>Mood Record: <label>{moodList.length}</label></h4>
                            </div>
                        </>
                    );

                }}
            />
        </main>
    );
}


function MoodCount({data}) {

    const items = [
        { 
            id: 1, 
            label: "Excited", 
            message: "You seem really excited today! Something awesome must've happened!", 
            img: "/EmotionCuteEmoji/4.png"
        },
        { 
            id: 2, 
            label: "Happy", 
            message: "You look really happy today! Keep spreading those positive vibes!", 
            img: "/EmotionCuteEmoji/1.png"
        },
        { 
            id: 3, 
            label: "Neutral", 
            message: "Feeling neutral today? That's completely okay — not every day has to be emotional.", 
            img: "/EmotionCuteEmoji/10.png"
        },
        { 
            id: 4, 
            label: "Sad", 
            message: "Feeling a bit sad today? It's okay — tough moments don't last, and you're not alone.", 
            img: "/EmotionCuteEmoji/11.png"
        },
        { 
            id: 5, 
            label: "Crying", 
            message: "Aww… feeling overwhelmed? It's okay to cry — you're doing your best, and that's enough.", 
            img: "/EmotionCuteEmoji/7.png"
        },
        { 
            id: 6, 
            label: "Angry", 
            message: "You seem a bit angry… it's alright. Take a deep breath — you've got this.", 
            img: "/EmotionCuteEmoji/6.png"
        },
        { 
            id: 7, 
            label: "Anxious", 
            message: "Feeling anxious today? It's okay — take things one step at a time. You're stronger than you think.", 
            img: "/EmotionCuteEmoji/12.png"
        },
        { 
            id: 8, 
            label: "Annoying", 
            message: "Something's annoying you, huh? It's okay — sometimes small things can really get to us.", 
            img: "/EmotionCuteEmoji/13.png"
        }
    ];

    // Check if data exists
    if (!data || !data.monthlyMoodCount) {
        return(
            <>
                <main className="moodCountDashboardWrapper">
                    <h1>Monthly Mood Count</h1>
                    <article className='emojiWrapper'>
                        Loading...
                    </article>
                </main>
            </>
        );
    }

    return(
        <>
            <main className="moodCountDashboardWrapper">
                <h1>Monthly Mood Count</h1>
                <article className='emojiWrapper'>
                    {items.map((emoji, index) => (
                        <div key={emoji.id}>
                            <h3 className="sectionTitle">{emoji.label}</h3>
                            <img 
                                src={emoji.img}
                                alt={emoji.label}
                            />
                            <h3>{data.monthlyMoodCount[index] || 0}</h3>
                        </div>
                    ))}
                </article>
            </main>
        </>
    );
}



export default Calender;