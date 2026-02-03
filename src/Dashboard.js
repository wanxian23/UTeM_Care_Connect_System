import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import "./css/Dashboard.css";
import teacherIcon from "./image/teacherIcon.png"
import {Header, Footer} from "./HeaderFooter";
import MessageBox from "./Modal";

function Dashboard() {

    useEffect(() => {
        document.title = "Dashboard";
    }, []);

    const [dashboardData, setDashboardData] = useState(null);

     const [stressLevel, setStressLevel] = useState(null);
     const [stressColor, setStressColor] = useState(null);
     const [quoteTitle, setQuoteTitle] = useState(null);

     useEffect(() => {
         const token = localStorage.getItem("token");
 
         if(!token){
             // No token, redirect to login
             window.location.href = "/";
             return;
         }
 
         fetch(`${process.env.REACT_APP_API_BASE_URL}/getDashboard.php`, {
             method: "GET",
             headers: {
                 "Authorization": "Bearer " + token
             }
         })
         .then(res => res.json())
         .then(data => {
             console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
             
             if(data.success){
                 setDashboardData(data);
 
                 // Calculate stress level immediately
                 const value = data.stressLevel;
                 let level = "", color = "";
                 if (value <= 20) {
                     color = "#BFE5C8";
                     level = "Very Low Stress";
                 } else if (value <= 40) {
                     color = "#d9f2dfff";
                     level = "Low Stress";
                 } else if (value <= 60) {
                     color = "#e4b995ff";
                     level = "Moderate Stress";
                 } else if (value <= 80) {
                     color = "#e9b6b6ff";
                     level = "High Stress";
                 } else if (value == "N/A") {
                    color = "#d2d2d2ff";
                    level = "Haven't Completed";
                 } else {
                     color = "#ee7878ff";
                     level = "Very High Stress";
                 }

                 const quoteValue = data.quoteType?.toLowerCase();
                 let quoteSentence = "";
                 if (quoteValue == "game") {
                    quoteSentence = "Game Time";
                 } else if (quoteValue == "positive") {
                    quoteSentence = "Happy Thoughts";
                 } else if (quoteValue == "calm") {
                    quoteSentence = "Calm Corner";
                 } else if (quoteValue == "motivation") {
                    quoteSentence = "Rise & Grind";
                 }
 
                 setStressLevel(level);
                 setStressColor(color);
                 setQuoteTitle(quoteSentence);
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
            <Body1 data={dashboardData} stressLevel={stressLevel} stressColor={stressColor} quoteTitle = {quoteTitle}/>
            <MoodCount data={dashboardData}/>
            <Footer />
        </>
    );
}

function Body1({data, stressLevel, stressColor, quoteTitle}) {
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

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const token = localStorage.getItem("token");
    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = "/Dashboard";
        }
    };

    // Use to button clicked (Act as form)
    // Handler function that sends feedback directly
    const submitFeedback = async (feedbackValue) => {
        const formData = new FormData();
        formData.append("thumbUp", feedbackValue); // PHP will receive this

        const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/quoteFeedbackRecord.php`,
            {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const result = await response.json();

        if (result.success) {
            setMessagebox({
                show: true,
                title: "Thank you for your feedback!",
                message: result.message,
                buttonValue: "OK",
                redirect: true
            });
        } else {
            setMessagebox({
                show: true,
                title: "Failed To Record Feedback!",
                message: "Failed To Record Your Feedback. Please Try Again!",
                buttonValue: "Try Again",
                redirect: false
            });
        }
    };

    // ===== TIME WINDOWS (24-hour format) =====
    const MORNING_START = "06:00";
    const MORNING_END   = "11:59";

    const AFTERNOON_START = "12:00";
    const AFTERNOON_END   = "23:59";

    const toTodayTime = (time) => {
        const [h, m] = time.split(":");
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };
    
    const now = new Date();

    const morningStart = toTodayTime(MORNING_START);
    const morningEnd   = toTodayTime(MORNING_END);

    const afternoonStart = toTodayTime(AFTERNOON_START);
    const afternoonEnd   = toTodayTime(AFTERNOON_END);

    const isMorning = now >= morningStart && now <= morningEnd;
    const isAfternoon = now >= afternoonStart && now <= afternoonEnd;

    let period = null;

    if (isMorning) period = "morning";
    else if (isAfternoon) period = "afternoon";

    // const getCurrentTime = () => {
    //     const now = new Date();
    //     return now.toTimeString().slice(0, 8);
    // };

    // const currentTime = getCurrentTime();
            
    if (!data || data?.recordAvailability.recordCount == 0) return (
        <main className="bodyDashboardFirst">
            <article className="moodRecordInfoWrapper">
                <div className="dashboardMoodDateWrapper">
                    <h2>{weekDay}</h2>
                    <h2>{formattedDate}</h2>
                    <h2>{formattedTime}</h2>
                </div>
                <div className="dashboardNoRecordWrapper">
                    <section>
                        {data?.recordAvailability.recordCount == 0 ?
                            <>
                                <h3>{data?.recordAvailability.message}</h3>
                                {data?.recordAvailability.buttonShow && 
                                    <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                }
                            </>
                        :   data?.recordAvailability.recordCount == 1 ?
                            <>
                                <h3>{data?.recordAvailability.message}</h3>
                                {data?.recordAvailability.buttonShow && 
                                    <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                }
                            </>
                        
                        :
                             <>
                                <h3>{data?.recordAvailability.message}</h3>
                                {data?.recordAvailability.buttonShow && 
                                    <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                }
                            </>
                        }
                    </section>
                </div>
            </article>   
            <div className='downWrapper'>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                </svg>&emsp;
                View The Analysis of Mood Below 
                &emsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                </svg>
            </div>
        </main>  
    );

    return(
        <>
            <main className="bodyDashboardFirst">
                <article className="moodRecordInfoWrapper">
                    <div className="dashboardMoodDateWrapper">
                        <h2>{weekDay}</h2>
                        <h2>{formattedDate}</h2>
                        <h2>{formattedTime}</h2>
                    </div>
                    <div className="dashboardMoodRecordLeftWrapper">
                        <h3 className="sectionTitle">Mood Record Reminder</h3>
                        <section>
                            {data?.recordAvailability.recordCount == 0 ?
                                <>
                                    <h3>{data?.recordAvailability.message}</h3>
                                    {data?.recordAvailability.buttonShow && 
                                        <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                    }
                                </>
                            :   data?.recordAvailability.recordCount == 1 ?
                                <>
                                    <h3>{data?.recordAvailability.message}</h3>
                                    {data?.recordAvailability.buttonShow && 
                                        <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                    }
                                </>
                            
                            :
                                <>
                                    <h3>{data?.recordAvailability.message}</h3>
                                    {data?.recordAvailability.buttonShow && 
                                        <button onClick={clickToMoodRecord}>Click Here To Record Now!</button>
                                    }
                                </>
                            }
                        </section>
                    </div>
                    <div className="dashboardMoodInfoWrapper">
                        <section className="first">
                            <h3 className="sectionTitle">Mood Changes Today</h3>
                            <div className="moodResultWrapper">
                                <div>
                                     <h3 className="sectionTitle period">Morning</h3>
                                    {data.moodRecordCount == 2 ?
                                        <>
                                            <img src={data.moodStoreLocation[0]}></img>
                                            <h3>{data.moodStatus[0]}</h3>
                                        </>
                                    : data.moodRecordCount == 1 ?
                                        <>
                                            {data.moodRecordTime[0]?.period === "morning" ?
                                                <>
                                                    <img src={data.moodStoreLocation[0]}></img>
                                                    <h3>{data.moodStatus[0]}</h3>
                                                </>
                                            :
                                                <>
                                                    <div className="noRecordWrapper">
                                                        <h4>No Record</h4>
                                                    </div>
                                                </>
                                            }
                                        </>
                                    :
                                        <div className="noRecordWrapper">
                                            <h4>No Record</h4>
                                        </div>
                                    }
                                </div>
                                <div>
                                    <p>Mood Changes</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="sectionTitle period">Afternoon</h3>
                                    {data.moodRecordCount == 2 ?
                                        <>
                                            <img src={data.moodStoreLocation[1]}></img>
                                            <h3>{data.moodStatus[1]}</h3>
                                        </>
                                    : data.moodRecordCount == 1 ?
                                        <>
                                            {data.moodRecordTime[0]?.period === "afternoon" ?
                                                <>
                                                    <img src={data.moodStoreLocation[0]}></img>
                                                    <h3>{data.moodStatus[0]}</h3>
                                                </>
                                            :
                                                <>
                                                    <div className="noRecordWrapper">
                                                        <h4>No Record</h4>
                                                    </div>
                                                </>
                                            }
                                        </>
                                    :
                                        <div className="noRecordWrapper">
                                            <h4>No Record</h4>
                                        </div>
                                    }
                                </div>
                            </div>
                        </section>
                        <section>
                            <h3 className="sectionTitle">Stress Level Today</h3>
                            <div className="moodResultWrapper">
                                <div>
                                    <h2
                                        style={{
                                        backgroundColor: `${stressColor}`}}
                                    >{data.stressLevel}%</h2>
                                    <h3>{stressLevel}</h3>
                                </div>
                            </div> 
                        </section>
                    </div>
                    <div className="dashboardFeedbackWrapper">
                        <h2>
                            <label className="sectionTitle">{quoteTitle}</label><br />
                            {data.quoteType === "game" ? 
                                <a href={data.quoteLink} target="_blank">
                                    {data.quote}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                        <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                    </svg>
                                </a>
                            : 
                            data.quote}
                        </h2>
                        {data.fbUsefulness ? (
                        <div className="quoteFeedbackWrapper">
                            <label>Feel Better?</label>
                            <button 
                                type="button" 
                                onClick={() => submitFeedback(1)} 
                                aria-label="Thumbs Up"
                            >
                            {data.fbUsefulness === 1 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                    <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                </svg>
                            )}
                            </button>
                            <button 
                                type="button" 
                                aria-label="Thumbs Down"
                                onClick={() => submitFeedback(0)}
                            >
                            {data.fbUsefulness === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-down-fill" viewBox="0 0 16 16">
                                    <path d="M6.956 14.534c.065.936.952 1.659 1.908 1.42l.261-.065a1.38 1.38 0 0 0 1.012-.965c.22-.816.533-2.512.062-4.51q.205.03.443.051c.713.065 1.669.071 2.516-.211.518-.173.994-.68 1.2-1.272a1.9 1.9 0 0 0-.234-1.734c.058-.118.103-.242.138-.362.077-.27.113-.568.113-.856 0-.29-.036-.586-.113-.857a2 2 0 0 0-.16-.403c.169-.387.107-.82-.003-1.149a3.2 3.2 0 0 0-.488-.9c.054-.153.076-.313.076-.465a1.86 1.86 0 0 0-.253-.912C13.1.757 12.437.28 11.5.28H8c-.605 0-1.07.08-1.466.217a4.8 4.8 0 0 0-.97.485l-.048.029c-.504.308-.999.61-2.068.723C2.682 1.815 2 2.434 2 3.279v4c0 .851.685 1.433 1.357 1.616.849.232 1.574.787 2.132 1.41.56.626.914 1.28 1.039 1.638.199.575.356 1.54.428 2.591"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
                                    <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/>
                                </svg>
                            )}
                            </button>
                        </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </article>
                <div className='downWrapper'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>&emsp;
                    View The Analysis of Mood Below 
                    &emsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>
                </div>
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

    return(
        <>
            <main className="moodCountDashboardWrapper">
                <h1>Weekly Mood Summary</h1>
                <article className='emojiWrapper'>
                    {items.map((emoji, index) => (
                        <div key={emoji.id}>
                            <h3>{data?.weeklyMoodCount[index] || 0}</h3>
                            <img 
                                src={emoji.img}
                                alt={emoji.label}
                            />
                            <h3 className="sectionTitle">{emoji.label}</h3>
                        </div>
                    ))}
                </article>
            </main>
        </>
    );
}

export default Dashboard;