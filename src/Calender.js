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

    if (!data || !data.dayRecord) {
        return (
            <main id="mainCalendarFirst">
                Loading....
            </main>
        );
    }

    // Convert dayRecord object keys to array of date strings
    const selectedDates = Object.keys(data.dayRecord);

    return (
        <main id="mainCalendarFirst">
            <Calendar
                className="customCalendar"
                tileContent={({ date, view }) => {
                    if (view !== "month") return null;

                    // Format current tile date as YYYY-MM-DD
                    const dateString = date.toISOString().split('T')[0];
                    
                    // Check if this date is in our selected dates
                    const isSelected = selectedDates.includes(dateString);

                    return isSelected ? (
                        <>
                            <div className="titleContent">
                                <img 
                                    src={data.moodStoreLocation[dateString]} 
                                    alt={data.moodStatus[dateString]}
                                />
                                <h4>{data.moodStatus[dateString]}</h4>
                            </div>
                            <div className="titleContent">
                                <h4>Mood Record: {1}</h4>
                            </div>
                        </>
                    ) : null;
                }}
            />
        </main>
    );
}


export default Calender;