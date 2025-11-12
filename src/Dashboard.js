import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import "./css/Dashboard.css";
import teacherIcon from "./image/teacherIcon.png"
import {Header, Footer} from "./HeaderFooter";

function Dashboard() {
    return(
        <>
            <Header />
            <Body1 />
            <Footer />
        </>
    );
}

function Body1() {
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
            <main id="bodyDashboardFirst">
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
                        <h3>You Seem Like Haven't Record Any Feelings Today Yet!</h3>
                        <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                    </div>
                </article>
                <div id='downWrapper'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>&emsp;
                    View The Analysis of Mood Below 
                    &emsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>
                </div>
            </main>
        </>
    );
}

export default Dashboard;