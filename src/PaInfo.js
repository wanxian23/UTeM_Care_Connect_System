import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

import "./css/StudentInfo.css";
import {HeaderCounsellor, Footer} from "./HeaderFooter";

function PaInfo() {

    useEffect(() => {
        document.title = "PA Info";
    }, []);

    const [paData, setPaData] = useState(null);

    const { paId } = useParams();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [stressLevel, setStressLevel] = useState("");
    const [stressColor, setStressColor] = useState("");
    
    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            window.location.href = "/";
            return;
        }

        fetch(`http://localhost:8080/care_connect_system/backend/api/getPaInfo.php?paId=${paId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);
            
            if(data.success){

                setPaData(data.PADetails || null);

            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, [paId]);

    const calculateStress = (value) => {
        let level = "", color = "";
        if (value <= 20) { color = "#BFE5C8"; level = "Very Low Stress"; }
        else if (value <= 40) { color = "#d9f2dfff"; level = "Low Stress"; }
        else if (value <= 60) { color = "#e4b995ff"; level = "Moderate Stress"; }
        else if (value <= 80) { color = "#e9b6b6ff"; level = "High Stress"; }
        else { color = "#ee7878ff"; level = "Very High Stress"; }

        setStressLevel(level);
        setStressColor(color);
    }

    return(
        <>
            <HeaderCounsellor />
            <PaInfoContent 
                paId={paId}
                paDetails={paData}
            />  
            {/* <Footer /> */}
        </>
    );
}

export function SubHeader({paId}) {

    return(
        <>
            <aside className="studentInfoAsideWrapper">
                <NavLink
                    to={"/PaInfo/"+paId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader studentInfo" : "subButton"
                    }
                >
                PA Information
                </NavLink>

                <NavLink
                    to={"/StudentAssignedTable/"+paId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader trendView" : "subButton"
                    }
                >
                Student Assigned <br></br>Dashboard
                </NavLink>
            </aside>
        </>
    );
}

function PaInfoContent({ 
    paId,
    paDetails
}) {  
    
    if (!paDetails) {
        return (
            <main className="studentInfoContentMain">
                <section className="studentInfoContentWrapper" style={{backgroundColor: "none"}}>
                    <div className="profileWrapper" style={{backgroundColor: "none", textAlign: "center"}}>
                        Loading...
                    </div>
                </section>
            </main>
        );
    }

    // Format to get date only (Without time)
    const dateOnly = new Date(paDetails.staffMemberSince)
    .toISOString()
    .split("T")[0];

    return(
        <>  
            <main className="studentInfoContentMain">
                <SubHeader paId={paId}/>
                <section className="studentInfoContentWrapper">
                    <div className="profileWrapper">
                        <h2>Student Information</h2>
                        <div className="profileContentWrapper">
                            <div className="profileImg">{paDetails.staffName[0]}</div>
                            <section className="personalInfoWrapper">
                                <aside>
                                    <label>Name:</label>
                                    <p>{paDetails.staffName}</p>
                                </aside>
                                <aside>
                                    <label>Email:</label>
                                    <p>
                                        <a href={`mailto:${paDetails.staffEmail}`}>{paDetails.staffEmail}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                            </svg>
                                        </a>
                                    </p>
                                </aside>
                                <aside>
                                    <label>Contact:</label>
                                    <p>
                                        <a href={`https://wa.me/6${paDetails.staffContact}`} target="_blank">{paDetails.staffContact}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                            </svg>
                                        </a>
                                    </p>
                                </aside>
                                <aside>
                                    <label>Faculty:</label>
                                    <p>{paDetails.staffFaculty}</p>
                                </aside>
                                <aside>
                                    <label>Office:</label>
                                    <p>{paDetails.staffOffice}</p>
                                </aside>
                                <aside>
                                    <label>Role:</label>
                                    <p>{paDetails.staffRole}</p>
                                </aside>
                                <aside>
                                    <label>Member Since:</label>
                                    <p>{dateOnly}</p>
                                </aside>
                            </section>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default PaInfo;