import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {Header, Footer} from "./HeaderFooterB4Login";
import MessageBox from "./Modal";
import "./css/Modal.css";

import './css/View2.css';
import tuahLogo from './image/tuahLogo.png';
import counsellingUnitInfoImg from './image/cousellingUnitInfo.jpeg';
import pppImg from './image/pppUTeM.jpg';

function View() {

    useEffect(() => {
        document.title = "Overview";
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if(token){
            // Token exists → user already logged in → redirect to dashboard
            window.location.href = "/Dashboard";
        }
    }, []);
    
    return(
        <>
            <Header />
            <Body1 />
            <Body2 />
            <Body3 />
            <Footer />
        </>
    );
}

function Body1() {

    const [navigateTo, setNavigateTo] = useState(null);

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: ""
    });

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (localStorage.getItem("token")) {
            window.location.href = navigateTo; // redirect after login success
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch("http://localhost:8080/care_connect_system/backend/api/login.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if(result.success){
            // Store token and user info
            localStorage.setItem("token", result.token);
            localStorage.setItem("userType", result.type);
            localStorage.setItem("userId", result.userId);
            
            if (result.type == "staff") {
                setNavigateTo("/DashboardPa");
            } else {
                setNavigateTo("/Dashboard");
            }

            setMessagebox({
                show: true,
                title: "Login Successful",
                message: "Welcome back! Redirecting...",
                buttonValue: "OK"
            });
        } else {
            setMessagebox({
                show: true,
                title: "Login Failed",
                message: result.message,
                buttonValue: "Try Again"
            });
        }
    };


    // For GSAP
    // Add [] means that below is a boolean not an array
    const [isClicked, setIsClicked] = useState(false);
    const titleBoxRef = useRef();
    const formBoxRef = useRef();
    const hiddenRef = useRef([]);

    const handleClick = () => {
        setIsClicked(false);

        if (!isClicked) {

            gsap.to(hiddenRef.current, {
                opacity: 0,
                duration: 0,
                display: "none"
                // onComplete: () => {
                //     gsap.set(hiddenRef.current, { display: "none" }); // hide after fade
                // },
            }, []);
            
            // If below more than 1 {}, then use fromTo
            // If only one {} then use .to
            gsap.fromTo(
                titleBoxRef.current,
                { opacity: 0 }, // start slightly off to the left
                { 
                    x: 0,                  // move back to center
                    opacity: 1, 
                    duration: 1.8,
                    ease: "power3.inOut"
                }
            );

            gsap.to(
            formBoxRef.current,
            // { opacity: 0 },
            {
                opacity: 1,
                x: 0,
                duration: 2,
                ease: "power2.out",
                onStart: () => {
                    gsap.set(formBoxRef.current, { display: "flex" });
                },
            }
            );
        }
    };

    return(
        <>
            <main id='first'>
                <div id='upWrapper' ref={titleBoxRef}>
                    <article ref={(el) => (hiddenRef.current[0] = el)}>
                        {/* <label>
                            Good Day
                        </label> */}
                        <h1>
                            Learn. Grow. Achieve.
                        </h1>
                        <p>
                            Care for your mind and emotions. <br></br>
                            Join us to start tracking, reflecting, and improving your wellbeing.
                        </p>
                        <div>
                            <button onClick={handleClick}>
                                Get Started!
                            </button>
                        </div>
                    </article>
                    <article id="viewLoginForm" ref={formBoxRef}>
                        <h2>UTeM Account Login</h2>
                        <form onSubmit={handleLogin}>
                            <div>
                                <label>Email</label><br></br>
                                <input type="text" name="email" placeholder="Enter Your University Email" required autoFocus="autofocus"></input>
                            </div>
                            <div>
                                <label>Password</label><br></br>
                                <input type="password" name="password" placeholder="Enter Password" required></input>
                            </div>
                            <div>
                                <input type="reset" value={"Clear"}></input>
                                <input type="submit" value={"Login"}></input>
                            </div>
                            <div>
                                <Link to="" className="forgetPassword">Forget Password</Link>
                            </div>
                        </form>
                    </article>
                    <article>
                        <img src={tuahLogo}></img>
                    </article>                    
                </div>
                <div id='downWrapper'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>&emsp;
                    View Content Below 
                    &emsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <   path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>
                </div>
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

function Body2() {
    const [hoverText, setHoverText] = useState("Try hover an emoji to see what it’s feeling ;)");
    const textRef = useRef(null); // Create the reference

    const items = [
        { id: 1, label: "pinkHappy", message: "Let your smile be the sunshine that brightens someone’s day — including your own!" },
        { id: 2, label: "yellowKing", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!" },
        { id: 3, label: "orangeThinking", message: "Every big idea starts with a little spark — take your time to think it through." },
        { id: 4, label: "yellowExcited", message: "Let’s gooo! The energy’s real — you’re on fire today!" },
        { id: 5, label: "greenEmbrarassing", message: "Oops… that was awkward! But hey, nobody’s perfect — you’re still awesome!" },
        { id: 6, label: "redAngry", message: "Take a breath… you’ve got this. Turn that fire into focus." },
        { id: 7, label: "blueCrying", message: "It’s okay to cry — even rain helps flowers grow." },
        { id: 8, label: "purpleAnnoying", message: "Ugh… some days just test your patience. Breathe — you’re stronger than this." },
        { id: 9, label: "blueJoking", message: "Sometimes laughter saves the moment — even the awkward ones!" }
    ];

      // Animate when text changes (For Emoji Message)
    useEffect(() => {
        if (hoverText) {
        gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.6, ease: "back.out(8)" }
        );
        } else {
        gsap.to(textRef.current, { opacity: 0, y: -10, duration: 0.4 });
        }
    }, [hoverText]);

    return(
        <>
            <main id='second'>
                <h1>Are you having a good mood so far ?</h1>
                <article id='emojiWrapper'>
                    <img src="/EmotionCuteEmoji/1.png" 
                        key={items[0].id}
                        onMouseEnter={() => setHoverText(items[0].message)}></img>
                    <img src="/EmotionCuteEmoji/2.png"
                        key={items[1].id}
                        onMouseEnter={() => setHoverText(items[1].message)}></img>
                    <img src="/EmotionCuteEmoji/3.png"
                        key={items[2].id}
                        onMouseEnter={() => setHoverText(items[2].message)}></img>
                    <img src="/EmotionCuteEmoji/4.png"
                        key={items[3].id}
                        onMouseEnter={() => setHoverText(items[3].message)}></img>
                    <img src="/EmotionCuteEmoji/5.png"
                        key={items[4].id}
                        onMouseEnter={() => setHoverText(items[4].message)}></img>
                    <img src="/EmotionCuteEmoji/6.png"
                        key={items[5].id}
                        onMouseEnter={() => setHoverText(items[5].message)}></img>
                    <img src="/EmotionCuteEmoji/7.png"
                        key={items[6].id}
                        onMouseEnter={() => setHoverText(items[6].message)}></img>
                    <img src="/EmotionCuteEmoji/8.png"
                        key={items[7].id}
                        onMouseEnter={() => setHoverText(items[7].message)}></img>
                    <img src="/EmotionCuteEmoji/9.png"
                        key={items[8].id}
                        onMouseEnter={() => setHoverText(items[8].message)}></img>
                </article>
                <article id='dialogBox'>
                    <p ref={textRef}>{hoverText}</p>
                </article>
            </main>
        </>
    );
}

function Body3() {
    return(
        <>
            <main id="third">
                <h1>Counselling Unit Information</h1>
                <div id="counsellingInfoWrapper">
                    <article>
                        <div className="counsellingContentWrapper">
                            <h2>Service Hours</h2>
                            <div>
                                <h3>Isnin - Khamis</h3>
                                <p>08:30 AM - 12:30 PM</p>
                                <p>02:30 PM - 04:30 PM</p>
                                <br></br>
                                <h3>Jumaat</h3>
                                <p>08:30 AM - 12:00 PM</p>
                                <p>03:00 PM - 04:30 PM</p>
                            </div>                            
                        </div>
                        <img src={counsellingUnitInfoImg}></img>
                    </article>
                    <article>
                        <iframe
                                title="UTeM PPP Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.2332654077853!2d102.31802887563614!3d2.3129836578584704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1f218df83b50d%3A0x3c77cdd52301ff8c!2sPusat%20Pengajian%20Pra-Universiti%20(UTeM)!5e0!3m2!1sen!2smy!4v1730093531722!5m2!1sen!2smy"
                                width="600"
                                height="450"
                                style={{ border: 0, borderRadius: "10px" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        <div className="counsellingContentWrapper">
                            <h2>Location</h2>
                            <div>
                                <h3>Psychology and Counseeling Units</h3>                                
                                <p>Aras 1, Pusat Persatuan Pelajar (PPP),<br></br>
                                Universiti Teknikal Malaysia Melaka.</p>   
                            </div>
                        </div>
                    </article>
                    <article>
                        <div className="counsellingContentWrapper">
                            <h2>Contact</h2>
                            <div>
                                <h3>Psychology Officer</h3>
                                <p>Encik Muhamad Hazrul Bin Md Esa</p>
                                <ul>
                                    <li>Email: hazrul@utem.edu.my</li>
                                    <li>HP: 06-2701915</li>
                                </ul>
                            </div>                            
                        </div>
                        <img src={pppImg}></img>
                    </article>
                </div>
            </main>
        </>
    );
}

export default View;