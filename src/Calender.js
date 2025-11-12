import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import {Header, Footer} from "./HeaderFooter";
import { NavLink } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import "./css/calendar.css";

function Calender() {
    return(
        <>
            <Header />
            <DateShow />
            <CalendarDesign />
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

function CalendarDesign() {
    const [value, setValue] = useState(new Date());

    return(
        <>
            <main id="mainCalendarFirst">
                <Calendar
                onChange={setValue}
                value={value}
                className="customCalendar"
                />
            </main>
        </>
    );
}

export default Calender;