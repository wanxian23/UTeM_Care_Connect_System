import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";

import "./css/dassAssessment.css";
import {Header, Footer} from "./HeaderFooter";
import utemLogo from "./image/utemLogo.png";

import MessageBox from "./Modal";
import { FOCUSABLE_SELECTOR } from "@testing-library/user-event/dist/utils";

function DassAssessment() {

    useEffect(() => {
        document.title = "DASS Assessment";
    }, []);

    return(
        <>
            <Header />
            <ContactDetails />
            <Footer />
        </>
    );
}

function ContactDetails() {

    const { contactId } = useParams();

    const [contactDetails, setContactDetails] = useState({});

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    // Use to check data
    useEffect(() => {

        const token = localStorage.getItem("token");
        
        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch(`http://localhost:8080/care_connect_system/backend/api/getContactDetails.php?contactId=${contactId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setContactDetails(data);

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
            <main className="dassFormWrapper">
                <div className="titleDescriptionWrapper">
                    <img src={utemLogo}></img>
                    <section className="title">
                        <h2>MEETING REQUEST FROM PA</h2>
                    </section>
                    <section className="contactDetails">
                        <p>
                            Hi {contactDetails.studentData?.studentName}, <br /><br /><br />

                            {contactDetails.contactData?.message} <br /><br /><br />

                            Best Regards, <br />
                            {contactDetails.paDetails?.staffName} <br />
                            Academic Advisor (PA) <br />
                            <a href={`mailto:${contactDetails.paDetails?.staffEmail}`}>{contactDetails.paDetails?.staffEmail}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                                    <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                                </svg>
                            </a>
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}

export default DassAssessment;