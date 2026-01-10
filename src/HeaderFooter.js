import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import './css/styleAfterLogin.css';
import careConnectIcon from './image/careConnectIcon.png';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import utemLogo from "./image/utemLogo.png";
import ftmkLogo from "./image/ftmkLogo.png";

function HeaderFooter() {
    return(
        <>
            
        </>
    );
}

function HeaderMargin() {
    return(
        <main id='headerMargin'>
            
        </main>
    );
}

export function Header() {
    
    const navigate = useNavigate();

    const [studentData, setStudentData] = useState(null);
    const [notificationData, setNotificationData] = useState(null);

    const notificationRef = useRef(null); // Ref for the dropdown
    const [showNoti, setShowNoti] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getStudentDetails.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setStudentData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getNotification.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setNotificationData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    // Notification box toggle
    const toggleNotification = () => {
        if(!showNoti){
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 1, height: 'auto', display: 'block'});
        } else {
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 0, height: 0, display: 'none'});
        }
        setShowNoti(!showNoti);
    }

    const handleNotificationClick = (notiData, index) => {
        navigate(notiData.location);

            // Call the API to update the status
        const token = localStorage.getItem("token");
        fetch(`http://localhost:8080/care_connect_system/backend/api/updateNotificationStatus.php?notificationId=${notiData.notificationId}`, {
            method: "GET", // since your PHP expects GET
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Notification status updated:", data);

            console.log("noti id: ", notiData.notificationId);

            // Update local state immediately to reflect change
            setNotificationData(prev => {
                return {
                    ...prev,
                    notificationData: prev.notificationData.map(noti => {
                        if(noti.notificationId === notiData.notificationId){
                            return {...noti, notiStatus: "READ"};
                        }
                        return noti;
                    })
                };
            });
        })
        .catch(err => console.error(err));
    }

    const goToNotification = () => {
        navigate("/Notification");
    }

    const hasUnread = notificationData?.notificationData?.some(
        noti => noti.notiStatus === "UNREAD"
    );

    return(
        <>
            <header>
                <a href='/Dashboard' id='logo'>
                    <img src={careConnectIcon} alt='Logo'></img>
                    <label>UTeM CareConnect</label>
                </a>
                <nav>
                    <Link to='/Dashboard' >Dashboard</Link>
                    <Link to='/MoodRecord' >Mood Record</Link>
                    <Link to='/Calender' >Calender</Link>
                    <Link to='/Statistic' >Statistic</Link>
                    {/* <a href='' id='signup'>Signup</a> */}
                </nav>
                <aside>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </aside>
                <section id='profileWrapper'>
                    <div className="notificationWrapper">
                        <svg
                            onClick={toggleNotification}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className={`bi ${hasUnread ? "bi-bell-fill" : "bi-bell"}`}
                            viewBox="0 0 16 16"
                        >
                            {hasUnread ? (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                            ) : (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                            )}
                        </svg>

                        <div className="notificationContentWrapper" ref={notificationRef}>
                            <div className="notiTitle">
                                <h3>Notification</h3>
                                <h5 onClick={goToNotification}>
                                    View All Notification
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                                    </svg>
                                </h5>
                            </div>
                            <div className="notiContent">
                                {notificationData?.notificationData?.map((notiData, index) => (
                                    notiData.notiStatus === "UNREAD" && (
                                        <section 
                                            key={index} 
                                            onClick={() => {
                                                handleNotificationClick(notiData, index);
                                            }}
                                            className={notiData.notiStatus}
                                            style={{
                                                opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5
                                            }}
                                        >
                                            <h4>{notiData.title}
                                                <p>
                                                    {/* Get formated date (Exp: 22 DEC 09:22 AM) */}
                                                    {new Date(notiData.notiCreatedDateTime).toLocaleString('en-US', {
                                                        day: '2-digit',
                                                        month: 'short',  // "Dec"
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true     // 12-hour format with AM/PM
                                                    }).replace(',', ',')
                                                    .toUpperCase()} 
                                                </p>
                                            </h4>
                                            <p>{notiData.description}</p>
                                        </section>
                                    )
                                ))}
                                <h4 style={{textAlign: "center", fontSize: "2vh"}}>-- Only Unread Notification Will Be Shown --</h4>
                            </div>
                        </div>
                    </div>
                    {/* <h3>xxx</h3> */}
                    <Link to='/Profile' className='link'>
                        {studentData?.studentData.studentName[0]}
                    </Link>
                </section>
            </header>
            <HeaderMargin />
        </>
    );
}

export function HeaderPa() {

    const navigate = useNavigate();

    const [PAData, setPAData] = useState(null);
    const [notificationData, setNotificationData] = useState(null);

    const notificationRef = useRef(null); // Ref for the dropdown
    const [showNoti, setShowNoti] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getPADetails.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setPAData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getNotificationPa.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setNotificationData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);
    
    // Notification box toggle
    const toggleNotification = () => {
        if(!showNoti){
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 1, height: 'auto', display: 'block'});
        } else {
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 0, height: 0, display: 'none'});
        }
        setShowNoti(!showNoti);
    }

    const handleNotificationClick = (notiData, index) => {
        navigate(notiData.location);

            // Call the API to update the status
        const token = localStorage.getItem("token");
        fetch(`http://localhost:8080/care_connect_system/backend/api/updateNotificationStatusPa.php?notificationId=${notiData.notificationId}`, {
            method: "GET", // since your PHP expects GET
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Notification status updated:", data);

            console.log("noti id: ", notiData.notificationId);

            // Update local state immediately to reflect change
            setNotificationData(prev => {
                return {
                    ...prev,
                    notificationData: prev.notificationData.map(noti => {
                        if(noti.notificationId === notiData.notificationId){
                            return {...noti, notiStatus: "READ"};
                        }
                        return noti;
                    })
                };
            });
        })
        .catch(err => console.error(err));
    }

    const goToNotification = () => {
        navigate("/NotificationPa");
    }

    const hasUnread = notificationData?.notificationData?.some(
        noti => noti.notiStatus === "UNREAD"
    );

    return(
        <>
            <header>
                <a href='/StudentTableData' id='logo'>
                    <img src={careConnectIcon} alt='Logo'></img>
                    <label>UTeM CareConnect</label>
                </a>
                <nav>
                    {/* <Link to='/StudentTableData' >Table Data</Link> */}
                    <Link to='/StudentTableData' >Dashboard</Link>
                    {/* <a href='' id='signup'>Signup</a> */}
                </nav>
                <aside>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </aside>
                <section id='profileWrapper' >
                    <div className="notificationWrapper">
                        <svg
                            onClick={toggleNotification}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className={`bi ${hasUnread ? "bi-bell-fill" : "bi-bell"}`}
                            viewBox="0 0 16 16"
                        >
                            {hasUnread ? (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                            ) : (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                            )}
                        </svg>

                        <div className="notificationContentWrapper" ref={notificationRef}>
                            <div className="notiTitle">
                                <h3>Notification</h3>
                                <h5 onClick={goToNotification}>
                                    View All Notification
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                                    </svg>
                                </h5>
                            </div>
                            <div className="notiContent">
                                {notificationData?.notificationData?.map((notiData, index) => (
                                    notiData.notiStatus === "UNREAD" && (
                                        <section 
                                            key={index} 
                                            className={notiData.notiStatus}
                                            onClick={() => {
                                                handleNotificationClick(notiData, index);
                                            }}
                                            style={{
                                                opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5
                                            }}
                                        >
                                            <h4>{notiData.title}
                                                <p>
                                                    {/* Get formated date (Exp: 22 DEC 09:22 AM) */}
                                                    {new Date(notiData.notiCreatedDateTime).toLocaleString('en-US', {
                                                        day: '2-digit',
                                                        month: 'short',  // "Dec"
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true     // 12-hour format with AM/PM
                                                    }).replace(',', ',')
                                                    .toUpperCase()} 
                                                </p>
                                            </h4>
                                            <p>{notiData.description}</p>
                                        </section>
                                    )
                                ))}
                                <h4 style={{textAlign: "center", fontSize: "2vh"}}>-- Only Unread Notification Will Be Shown --</h4>
                            </div>
                        </div>
                    </div>
                    {/* <h3>xxx</h3> */}
                    <Link to='/ProfilePa' className='link'>
                        {PAData?.PAData.staffName[0]}
                    </Link>
                </section>
            </header>
            <HeaderMargin />
        </>
    );
}

export function HeaderCounsellor() {
    const navigate = useNavigate();

    const [PAData, setPAData] = useState(null);
    const [notificationData, setNotificationData] = useState(null);

    const notificationRef = useRef(null); // Ref for the dropdown
    const [showNoti, setShowNoti] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getPADetails.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setPAData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch("http://localhost:8080/care_connect_system/backend/api/getNotificationPa.php", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setNotificationData(data);
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);
    
    // Notification box toggle
    const toggleNotification = () => {
        if(!showNoti){
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 1, height: 'auto', display: 'block'});
        } else {
            gsap.to(notificationRef.current, {duration: 0.3, opacity: 0, height: 0, display: 'none'});
        }
        setShowNoti(!showNoti);
    }

    const handleNotificationClick = (notiData, index) => {
        navigate(notiData.location);

            // Call the API to update the status
        const token = localStorage.getItem("token");
        fetch(`http://localhost:8080/care_connect_system/backend/api/updateNotificationStatusPa.php?notificationId=${notiData.notificationId}`, {
            method: "GET", // since your PHP expects GET
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Notification status updated:", data);

            console.log("noti id: ", notiData.notificationId);

            // Update local state immediately to reflect change
            setNotificationData(prev => {
                return {
                    ...prev,
                    notificationData: prev.notificationData.map(noti => {
                        if(noti.notificationId === notiData.notificationId){
                            return {...noti, notiStatus: "READ"};
                        }
                        return noti;
                    })
                };
            });
        })
        .catch(err => console.error(err));
    }

    const goToNotification = () => {
        navigate("/NotificationCounsellor");
    }

    const hasUnread = notificationData?.notificationData?.some(
        noti => noti.notiStatus === "UNREAD"
    );

    return(
        <>
            <header>
                <a href='/StatisticCounsellor' id='logo'>
                    <img src={careConnectIcon} alt='Logo'></img>
                    <label>UTeM CareConnect</label>
                </a>
                <nav>
                    <Link to='/TableDataCounselling' >Dashboard</Link>
                    <Link to='/StatisticCounsellor' >Statistic</Link>
                </nav>
                <aside>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </aside>
                <section id='profileWrapper' >
                    <div className="notificationWrapper">
                        <svg
                            onClick={toggleNotification}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className={`bi ${hasUnread ? "bi-bell-fill" : "bi-bell"}`}
                            viewBox="0 0 16 16"
                        >
                            {hasUnread ? (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                            ) : (
                                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                            )}
                        </svg>

                        <div className="notificationContentWrapper" ref={notificationRef}>
                            <div className="notiTitle">
                                <h3>Notification</h3>
                                <h5 onClick={goToNotification}>
                                    View All Notification
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                                    </svg>
                                </h5>
                            </div>
                            <div className="notiContent">
                                {notificationData?.notificationData?.map((notiData, index) => (
                                    notiData.notiStatus === "UNREAD" && (
                                        <section 
                                            key={index} 
                                            className={notiData.notiStatus}
                                            onClick={() => {
                                                handleNotificationClick(notiData, index);
                                            }}
                                            style={{
                                                opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5
                                            }}
                                        >
                                            <h4>{notiData.title}
                                                <p>
                                                    {/* Get formated date (Exp: 22 DEC 09:22 AM) */}
                                                    {new Date(notiData.notiCreatedDateTime).toLocaleString('en-US', {
                                                        day: '2-digit',
                                                        month: 'short',  // "Dec"
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true     // 12-hour format with AM/PM
                                                    }).replace(',', ',')
                                                    .toUpperCase()} 
                                                </p>
                                            </h4>
                                            <p>{notiData.description}</p>
                                        </section>
                                    )
                                ))}
                                <h4 style={{textAlign: "center", fontSize: "2vh"}}>-- Only Unread Notification Will Be Shown --</h4>
                            </div>
                        </div>
                    </div>
                    {/* <h3>xxx</h3> */}
                    <Link to='/ProfileCounsellor' className='link'>
                        {PAData?.PAData.staffName[0]}
                    </Link>
                </section>
            </header>
            <HeaderMargin />
        </>
    );
}

export function Footer() {
    return(
        <>
            <footer>
                <article>
                    <div>
                        <h2>Resources</h2>
                        <content id="resourceInfo">
                            <a href="https://www.utem.edu.my/en/" target="_blank">
                                UTeM Official Website
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                    <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                </svg>
                            </a>

                            <a href="https://ftmk.utem.edu.my/web/" target="_blank">
                                UTeM FTMK Official Website
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                    <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                </svg>
                            </a>

                            <a href="https://hep.utem.edu.my/bimbingan-kaunseling-2/" target="_blank">
                                Counseling Unit Official Website
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                    <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                </svg>
                            </a>
                        </content>
                    </div>
                    <div>
                        <h2>Contact Us</h2>
                        <content id="contactInfo">
                            <p>Email:<br /> xxx@utem.edu.my</p>
                            <p>Phone Number:<br /> xxx@utem.edu.my</p>
                        </content>
                    </div>
                    <div>
                        <h2>Follow Us</h2>
                        <content id='socialMediaIcon'>
                            {/* FB */}
                            <a href="https://www.facebook.com/MyUTeM/" target="_blank">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16" id='fb' >
                                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                                </svg>
                            </a>
                            {/* Insta */}
                            <a href="https://www.instagram.com/myutem/" target="_blank">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16" id='ig'>
                                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                                </svg>
                            </a>
                            {/* Youtube */}
                            <a href="https://www.youtube.com/channel/UCmJKvkfmZf4pbXwDqo2sZZg" target="_blank">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-youtube" viewBox="0 0 16 16" id='yt'>
                                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
                                </svg>  
                            </a>
                            {/* X */}
                            <a href="https://x.com/myutem" target="_blank">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16" id='x'>
                                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                                </svg>
                            </a>
                        </content>
                    </div>
                    <div id='logoInfo'>
                        <img src={utemLogo}></img>
                        <img src={ftmkLogo}></img>
                    </div>
                </article>
                <hr></hr>
                <div id='rights'>
                    Copyright &copy; UTeM CareConnect 2025. All Rights Reserved.
                </div>
            </footer>
        </>
    );
}


export default HeaderFooter;