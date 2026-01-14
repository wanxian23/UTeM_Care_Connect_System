import React, { useState, useEffect, useRef } from "react";
import {HeaderPa, Footer} from "./HeaderFooter";
import { useNavigate } from "react-router-dom";

import "./css/notification.css";
import MessageBox from "./Modal";

function NotificationPa() {

    useEffect(() => {
        document.title = "Notification";
    }, []);
    

    return(
        <>
            <HeaderPa />
            <NotificationBody />
            <Footer />
        </>
    );
}

function NotificationBody() {

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = "/NotificationPa";
        }
    };

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const navigate = useNavigate();

    const [totalNoti, setTotalNoti] = useState(0);
    const [activeTab, setActiveTab] = useState("all");
    const [selected, setSelected] = useState([]); 

    const buttonActivation = selected.length > 0 ? "active" : "inactive";
    const buttonActive = selected.length === 0;
    const selectedCount = selected.length;

    const [notificationData, setNotificationData] = useState([]);

    const unreadCount = notificationData.filter(n => n.notiStatus === "UNREAD").length;

    // update state
    useEffect(() => {
        setTotalNoti(unreadCount);
    }, [unreadCount]);

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
                setNotificationData(data.notificationData);
                
            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    const handleNotificationClickReadOnly = (notiData) => {
        // Navigate to the relevant page
        navigate(notiData.location);

        const token = localStorage.getItem("token");

        // Update status in database
        fetch(
            `http://localhost:8080/care_connect_system/backend/api/updateNotificationStatusPa.php?notificationIdReadOnly=${notiData.notificationId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        )
        .then(res => res.json())
        .then(data => {
            console.log("Notification status updated:", data);

            // Update UI immediately
            setNotificationData(prev =>
                prev.map(noti =>
                    noti.notificationId === notiData.notificationId
                        ? { ...noti, notiStatus: "READ" }
                        : noti
                )
            );
        })
        .catch(err => console.error(err));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select ALL visible notifications based on the current tab
            let ids = notificationData
                .filter(n => {
                    if (activeTab === "all") return true;
                    if (activeTab === "unread") return n.notiStatus === "UNREAD";
                    if (activeTab === "read") return n.notiStatus === "READ";
                })
                .map(n => n.notificationId);

            setSelected(ids);
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id) => {

        setSelected(prev => 
            prev.includes(id)
                ? prev.filter(item => item !== id)  // unselect
                : [...prev, id]                      // select
        );
    };

    const handleBulkMarkRead = () => {
        if (selected.length === 0) return;

        const token = localStorage.getItem("token");

        // API call for multiple IDs
        fetch("http://localhost:8080/care_connect_system/backend/api/updateNotificationBulkPa.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                ids: selected,
                newStatus: "READ"
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Bulk status updated:", data);

            // Update UI instantly
            setNotificationData(prev =>
                prev.map(noti =>
                    selected.includes(noti.notificationId)
                        ? { ...noti, notiStatus: "READ" }
                        : noti
                )
            );

            // Clear selected checkboxes
            setSelected([]);

            setMessagebox({
                ...messagebox,
                show: true,
                title: "READ Status Changed Successfully",
                message: `Notification status successfully changed to READ.`,
                buttonValue: "OK"
            });
        })
        .catch(err => console.error(err));
    };

    const handleBulkMarkUnread = () => {
        if (selected.length === 0) return;

        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/care_connect_system/backend/api/updateNotificationBulkPa.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                ids: selected,
                newStatus: "UNREAD"
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Bulk status updated:", data);

            setNotificationData(prev =>
                prev.map(noti =>
                    selected.includes(noti.notificationId)
                        ? { ...noti, notiStatus: "UNREAD" }
                        : noti
                )
            );

            setSelected([]);

            setMessagebox({
                ...messagebox,
                show: true,
                title: "UNREAD Status Changed Successfully",
                message: `Notification status successfully changed to UNREAD.`,
                buttonValue: "OK"
            });
        })
        .catch(err => console.error(err));
    };

    const toggleStatus = (notificationId) => {

        console.log("Toggle button clicked for:", notificationId); // ✅ Add this debug

        const token = localStorage.getItem("token");

        fetch(
            `http://localhost:8080/care_connect_system/backend/api/updateNotificationStatusPa.php?notificationId=${notificationId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        )
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Update UI immediately
                setNotificationData(prev =>
                    prev.map(noti =>
                        noti.notificationId === notificationId
                            ? { ...noti, notiStatus: data.newStatus }
                            : noti
                    )
                );

                setMessagebox({
                    ...messagebox,
                    show: true,
                    title: "Status Changed Successfully",
                    message: `Notification status successfully changed.`,
                    buttonValue: "OK"
                });
            } else {
                console.error("Failed to toggle:", data.message);
                setMessagebox({
                    ...messagebox,
                    show: true,
                    title: "Status Changed Failed",
                    message: `Notification status fail to changed.`,
                    buttonValue: "OK"
                });
            }
        })
        .catch(err => console.error(err));
    };

    return(
        <>
            <main className="notificationBodyWrapper">
                <section className="notiTitle">
                    <div>
                        <h2>Notifications</h2>
                        <p>You've {totalNoti} unread notifications</p>
                    </div>
                    <div>
                        <button 
                            onClick={handleBulkMarkUnread}
                            disabled={selected.length === 0}
                        >
                            Mark As Unread {selected.length > 0 && `(${selected.length})`}
                        </button>

                        <button 
                            onClick={handleBulkMarkRead}
                            disabled={selected.length === 0}
                        >
                            Mark As Read {selected.length > 0 && `(${selected.length})`}
                        </button>

                    </div>
                </section>
                <section className="notiContent">
                    <div>
                        <button
                            className={activeTab === "all" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>
                        <button
                            className={activeTab === "unread" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("unread")}
                        >
                            Unread
                        </button>
                        <button
                            className={activeTab === "read" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("read")}
                        >
                            Read
                        </button>
                    </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <input 
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                selected.length > 0 &&
                                                (
                                                    (activeTab === "all" && selected.length === notificationData.length) ||
                                                    (activeTab === "unread" && selected.length === notificationData.filter(n => n.notiStatus === "UNREAD").length) ||
                                                    (activeTab === "read" && selected.length === notificationData.filter(n => n.notiStatus === "READ").length)
                                                )
                                            }
                                        />
                                    </th>
                                    <th>Notification</th>
                                    <th>Timeline</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === "all" && (
                                    <>
                                        {notificationData.length > 0 ? (
                                            notificationData.map((notiData) => (
                                                <tr
                                                    key={notiData.notificationId}
                                                    className={notiData.notiStatus}
                                                    onClick={() => handleNotificationClickReadOnly(notiData)}
                                                >
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(notiData.notificationId)}
                                                            onChange={() => handleSelectOne(notiData.notificationId)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>

                                                    <td style={{ opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5 }}>
                                                        <h4>{notiData.title}</h4>
                                                        <p>{notiData.description}</p>
                                                    </td>

                                                    <td style={{ opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5 }}>
                                                        {new Date(notiData.notiCreatedDateTime)
                                                            .toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            .toUpperCase()}
                                                        <br />
                                                        {new Date(notiData.notiCreatedDateTime)
                                                            .toLocaleTimeString("en-GB", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            })
                                                            .toUpperCase()}
                                                    </td>

                                                    <td>
                                                        {notiData.notiStatus === "READ" && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleStatus(notiData.notificationId);
                                                                }}
                                                            >
                                                                Mark As Unread
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{borderRadius: "0 0 20px 20px"}}>No Notification</td>
                                            </tr>
                                        )}
                                    </>
                                )}

                                {activeTab === "unread" && (
                                    <>
                                        {notificationData.filter(n => n.notiStatus === "UNREAD").length > 0 ? (
                                            notificationData
                                                .filter(n => n.notiStatus === "UNREAD")
                                                .map((notiData) => (
                                                    <tr
                                                        key={notiData.notificationId}
                                                        onClick={() => handleNotificationClickReadOnly(notiData)}
                                                        style={{ opacity: 1 }}
                                                    >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(notiData.notificationId)}
                                                                onChange={() => handleSelectOne(notiData.notificationId)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </td>

                                                        <td>
                                                            <h4>{notiData.title}</h4>
                                                            <p>{notiData.description}</p>
                                                        </td>

                                                        <td>
                                                            {new Date(notiData.notiCreatedDateTime)
                                                                .toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })
                                                                .toUpperCase()}
                                                            <br />
                                                            {new Date(notiData.notiCreatedDateTime)
                                                                .toLocaleTimeString("en-GB", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                .toUpperCase()}
                                                        </td>

                                                        <td></td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{borderRadius: "0 0 20px 20px"}}>No notification that's UNREAD</td>
                                            </tr>
                                        )}
                                    </>
                                )}
                                {activeTab === "read" && (
                                    <>
                                        {notificationData.filter(n => n.notiStatus === "READ").length > 0 ? (
                                            notificationData
                                                .filter(n => n.notiStatus === "READ")
                                                .map((notiData) => (
                                                    <tr
                                                        key={notiData.notificationId}
                                                        className={notiData.notiStatus}
                                                        onClick={() => handleNotificationClickReadOnly(notiData)}
                                                    >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(notiData.notificationId)}
                                                                onChange={() => handleSelectOne(notiData.notificationId)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </td>

                                                        <td style={{opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5}}>
                                                            <h4>{notiData.title}</h4>
                                                            <p>{notiData.description}</p>
                                                        </td>

                                                        <td style={{opacity: notiData.notiStatus === "UNREAD" ? 1 : 0.5}}>
                                                            {new Date(notiData.notiCreatedDateTime)
                                                                .toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })
                                                                .toUpperCase()}
                                                            <br />
                                                            {new Date(notiData.notiCreatedDateTime)
                                                                .toLocaleTimeString("en-GB", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                .toUpperCase()}
                                                        </td>

                                                        <td>
                                                            {notiData.notiStatus === "READ" &&
                                                                <button
                                                                    onClick={(e) => {
                                                                    e.stopPropagation(); // prevent row click
                                                                    toggleStatus(notiData.notificationId);
                                                                    }}
                                                                >
                                                                    {notiData.notiStatus === "READ" ? "Mark As Unread" : "Mark As Read"}
                                                                </button>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{borderRadius: "0 0 20px 20px"}}>No notification that's READ</td>
                                            </tr>
                                        )}
                                    </>
                                )} 
                            </tbody>
                        </table>
                </section>
            </main>
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
        </>
    );
} 


export default NotificationPa;