import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import "./css/DashboardPa.css";
import teacherIcon from "./image/teacherIcon.png"
import {HeaderPa, Footer} from "./HeaderFooter";
import MessageBox from "./Modal";

function Dashboard() {

    const [dashboardData, setDashboardData] = useState(null);

     useEffect(() => {
         const token = localStorage.getItem("token");
 
         if(!token){
             // No token, redirect to login
             window.location.href = "/";
             return;
         }
 
         fetch("http://localhost:8080/care_connect_system/backend/api/getDashboardPa.php", {
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
            <HeaderPa />
            <StudentOverview/>
            <Footer />
        </>
    );
}

function StudentOverview() {

    return(
        <>
            <main className="studentOverviewMain">
                
            </main>
        </>
    );
}



export default Dashboard;