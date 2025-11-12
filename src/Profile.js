import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {Header, Footer} from "./HeaderFooter";

import "./css/profile.css";

function Profile() {
    return(
        <>
            <Header />
            <Body1 />
            <Footer />
        </>
    );
}

function Body1() {
    // Add [] means that below is a boolean not an array
    const [isClicked, setIsClicked] = useState(false);
    const formBoxRef = useRef();
    const buttonRef = useRef();

    const changePassword = () => {
        setIsClicked(true);

        const tl = gsap.timeline();

        // Step 1: Fade out the button
        tl.to(buttonRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power3.inOut",
            onComplete: () => {
            gsap.set(buttonRef.current, { display: "none" });
            },
        });

        // Step 2: Fade in the form AFTER button fades out
        tl.to(formBoxRef.current, {
            opacity: 1,
            duration: 1.3, // slower fade-in ✨
            ease: "power2.out",
            onStart: () => {
            gsap.set(formBoxRef.current, { display: "flex" });
            },
        });
    };

    return(
        <>
            <main id="mainProfileFirst">
                <div className="profileWrapper">
                    <h2>Personal Information</h2>
                    <div id="profileContentWrapper">
                        <div id="profileImg">X</div>
                        <section id="personalInfoWrapper">
                            <aside>
                                <label>Name:</label>
                                <p>XXX</p>
                            </aside>
                        <aside>
                                <label>Faculty:</label>
                                <p>XXX</p>
                            </aside>
                        <aside>
                                <label>Section & Group:</label>
                                <p>XXX</p>
                            </aside>
                        <aside>
                                <label>Member Since:</label>
                                <p>XXX</p>
                            </aside>
                            <aside>
                                <label>Member Since:</label>
                                <p>XXX</p>
                            </aside>
                            <aside>
                                <label>Member Since:</label>
                                <p>XXX</p>
                            </aside>
                        </section>
                    </div>
                </div>

                <div className="profileWrapper">
                    <h2>Change Password</h2>
                    <div id="profileContentWrapper">
                        <section id="personalInfoWrapper">
                            <aside>
                                <button onClick={changePassword} ref={buttonRef} id="changePassBt">Change Your Password</button>
                            </aside>
                            <form ref={formBoxRef}>
                                <aside>
                                    <label>New Password:</label>
                                    <input type="password" placeholder="New Password"></input>
                                </aside>
                                <aside>
                                    <label>Type Again Password:</label>
                                    <input type="password" placeholder="Type Again New Password"></input>
                                </aside>
                                <aside>
                                    <button>Save</button>
                                </aside>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Profile;