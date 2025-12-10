import React, { useState, useEffect, useRef } from "react";
import {HeaderPa, Footer} from "./HeaderFooter";

import "./css/notification.css";

function NotificationPa() {
    return(
        <>
            <HeaderPa />
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


export default NotificationPa;