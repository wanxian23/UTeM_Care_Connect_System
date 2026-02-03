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
            <DassForm />
            <Footer />
        </>
    );
}

function DassForm() {

    const { dassId } = useParams();

    const [dassData, setDassData] = useState({});

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

     // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href =  `/DassAssessment/${dassId}`;
        }
    };

    // Use to check data
    useEffect(() => {

        const token = localStorage.getItem("token");
        
        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch(`${process.env.REACT_APP_API_BASE_URL}/getDassAssessment.php?dassId=${dassId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setDassData(data);

            } else {
                // Token invalid → clear storage & redirect
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error(err));
    }, []);

    // // Use to complete the form
    const submitDass = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const formData = new FormData(e.target);

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recordDass.php?dassId=${dassId}`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const result = await response.json();

        if(result.success){
            setMessagebox({
                show: true,
                title: "DASS Recorded Successfully",
                message: "DASS assessment recorded successfully! Have a nice day.",
                buttonValue: "OK",
                redirect: true
            });
        } else {
            setMessagebox({
                show: true,
                title: "DASS Record Failed",
                message: "DASS assessment recorded failed! Please try again...",
                buttonValue: "Try Again",
                redirect: false
            });
        }

    };

    return(
        <>
            <main className="dassFormWrapper">
                {dassData?.dassData?.status === "Pending" ?
                    <div className="titleDescriptionWrapper">
                        <img src={utemLogo}></img>
                        <section className="title">
                            <h2>HEALTHY MIND SCREENING</h2>
                            <h2>Depression Anxiety Stress Scale (DASS)</h2>
                        </section>
                        <section className="instruction">
                            <p>
                                Please read each statement and circle the answer on the scale of 0,1,2 or 3 that best describes YOUR state of mind LAST WEEK.
                                There are no right or wrong answers.
                                DO NOT spend too much time on any statement.
                            </p>
                        </section>
                        <section className="description">
                            <h3>The scoring scale is as follows:</h3>
                            <p>
                                <label>0 = Never</label>
                                <label>1 = Rarely</label>
                                <label>2 = Often</label>
                                <label>3 = Very Often</label>
                            </p>
                        </section>
                        <form onSubmit={submitDass}>
                            {dassData?.dassQuestions?.map((dassQuestion, index) => (
                                <section>
                                    <div>
                                        <h3>{index + 1}.</h3>
                                        <h3>{dassQuestion.question}</h3>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`q${index}`} value={0} required></input>0</label>
                                        <label><input type="radio" name={`q${index}`} value={1} required></input>1</label>
                                        <label><input type="radio" name={`q${index}`} value={2} required></input>2</label>
                                        <label><input type="radio" name={`q${index}`} value={3} required></input>3</label>
                                    </div>
                                </section>
                            ))}
                            <section>
                                <input type="reset"></input>
                                <input type="submit"></input>
                            </section>
                        </form>
                    </div>
                :
                    <div className="titleDescriptionWrapper">
                        <img src={utemLogo}></img>
                        <section className="title">
                            <h2>HEALTHY MIND SCREENING</h2>
                            <h2>Depression Anxiety Stress Scale (DASS)</h2>
                        </section>
                        <section className="completedDass">
                            DASS Assessment Completed! Stay Happy Ya :)
                        </section>
                    </div>
                }
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

export default DassAssessment;