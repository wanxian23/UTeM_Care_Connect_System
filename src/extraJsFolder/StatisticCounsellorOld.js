import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import "./css/StudentTableData.css";
import {HeaderCounsellor, Footer} from "./HeaderFooter";
import {TrendGraph, StressTrendGraph} from "./Statistic";
import MessageBox, {ConfirmationModal, TextareaModal} from "./Modal";

function StatisticCounsellor() {

    useEffect(() => {
        document.title = "Statistic";
    }, []);

    const [allPADetails, setAllPADetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    // Control SubHeader
    const [activeTab, setActiveTab] = useState("moodTrend");
    const [selected, setSelected] = useState([]); // ✅ Move selected state here

    // Control SubHeader
    const [facultyTab, setFacultyTab] = useState("all");

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
                 setAllPADetails(data.allPADetails);
                 setDashboardData(data.dashboardData);
 
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
            <HeaderCounsellor />
            <main className="statisticBodyWrapper"
             style={{
                gap: "50px"
             }}
            >
                <nav className="statisticNav">
                    <div>
                        <button 
                            className={activeTab === "moodTrend" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("moodTrend")}
                        >
                            Mood & Stress Statistic View
                        </button>
                    </div>
                    <div>
                        <button 
                            className={activeTab === "stressTrend" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("stressTrend")}
                        >
                            Dass Trend View
                        </button>
                    </div>
                </nav>
                <FacultySelection 
                    facultyTab={facultyTab}
                    setFacultyTab={setFacultyTab}
                />
                {activeTab === "moodTrend" && (
                    <>

                        <div></div>
                    </>
                )}
                {activeTab === "Dass Trend" && (
                    <>

                        <div></div>
                    </>
                )}
    
            </main>
            <Footer />
        </>
    );
}

function FacultySelection({facultyTab, setFacultyTab}) {

    return(
        <>
            <main className="facultySelectionWrapper">
                <button
                    className={facultyTab === "all" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("all")}
                >
                    All
                </button>

                <button
                    className={facultyTab === "FTKEK" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FTKEK")}
                >
                    FTKEK
                </button>

                <button
                    className={facultyTab === "FTKE" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FTKE")}
                >
                    FTKE
                </button>

                <button
                    className={facultyTab === "FTKM" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FTKM")}
                >
                    FTKM
                </button>

                <button
                    className={facultyTab === "FTKIP" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FTKIP")}
                >
                    FTKIP
                </button>

                <button
                    className={facultyTab === "FTMK" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FTMK")}
                >
                    FTMK
                </button>

                <button
                    className={facultyTab === "FPTT" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FPTT")}
                >
                    FPTT
                </button>

                <button
                    className={facultyTab === "FAIX" ? "activeBtn" : ""}
                    onClick={() => setFacultyTab("FAIX")}
                >
                    FAIX
                </button>
            </main>
        </>  
    );
}


export default StatisticCounsellor;