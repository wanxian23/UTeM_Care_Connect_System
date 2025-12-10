import React, { useState, useEffect, useRef } from "react";
import {Header, Footer} from "./HeaderFooter";

import "./css/notification.css";

function Notification() {
    return(
        <>
            <Header />
            <NotificationBody />
            <Footer />
        </>
    );
}

function NotificationBody() {
    return(
        <>
            <main className="notificationBodyWrapper">
                
            </main>
        </>
    );
} 

export default Notification;