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
            <Login />
            <Body2 />
            <Body3 />
            <Footer />
        </>
    );
}

function Login() {
    const [navigateTo, setNavigateTo] = useState(null);
    const [scene, setScene] = useState("landing");

    // ================= MODAL =================
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: ""
    });

    const handleModalButton = () => {
        setMessagebox({ ...messagebox, show: false });
        if (localStorage.getItem("token")) {
            window.location.href = navigateTo;
        }
    };

    // ================= LOGIN =================
    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch(
                "http://localhost:8080/care_connect_system/backend/api/login.php",
                { method: "POST", body: formData }
            );

            if (!response.ok) throw new Error("Server error");

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("userType", result.type);
                localStorage.setItem("userId", result.userId);

                if (result.type === "staff") setNavigateTo("/StudentTableData");
                else if (result.type === "counsellor") setNavigateTo("/TableDataCounselling");
                else setNavigateTo("/Dashboard");

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
        } catch {
            setMessagebox({
                show: true,
                title: "Connection Error",
                message: "Unable to reach the server.",
                buttonValue: "OK"
            });
        }
    };

    // ================= FORGET PASSWORD FLOW =================
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 1: Send PIN to email
    // Step 1: Send PIN to email
    const handleForgetPasswordSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setMessagebox({
                show: true,
                title: "Email Required",
                message: "Please enter your email address.",
                buttonValue: "OK"
            });
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/care_connect_system/backend/api/forgetPassword.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                }
            );

            const result = await response.json();

            if (result.success) {
                // ✅ FOR DEVELOPMENT: Show PIN in modal
                const debugMsg = result.debug_pin 
                    ? `${result.message}\n\nDEBUG PIN: ${result.debug_pin}\n(This will be sent via email in production)`
                    : result.message;
                
                setMessagebox({
                    show: true,
                    title: "PIN Sent Successfully",
                    message: debugMsg,
                    buttonValue: "OK"
                });
                
                // Also log to console
                if (result.debug_pin) {
                    console.log("DEBUG PIN:", result.debug_pin);
                    console.log("Email:", result.debug_email);
                }
                
                setScene("pin");
            } else {
                setMessagebox({
                    show: true,
                    title: "Request Failed",
                    message: result.message || "Unable to send PIN. Please try again.",
                    buttonValue: "OK"
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setMessagebox({
                show: true,
                title: "Connection Error",
                message: "Unable to reach the server. Please try again.",
                buttonValue: "OK"
            });
        }
    };

    // Step 2: Verify PIN
    const handlePinVerification = async (e) => {
        e.preventDefault();

        if (!email || !pin) {
            setMessagebox({
                show: true,
                title: "Missing Information",
                message: "Please enter both email and PIN.",
                buttonValue: "OK"
            });
            return;
        }

        if (pin.length !== 6) {
            setMessagebox({
                show: true,
                title: "Invalid PIN",
                message: "PIN must be exactly 6 digits.",
                buttonValue: "OK"
            });
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/care_connect_system/backend/api/verifyPin.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, pin })
                }
            );

            const result = await response.json();

            if (result.success) {
                setMessagebox({
                    show: true,
                    title: "PIN Verified",
                    message: "PIN verified successfully. You can now reset your password.",
                    buttonValue: "OK"
                });
                setScene("resetPass");
            } else {
                setMessagebox({
                    show: true,
                    title: "Verification Failed",
                    message: result.message || "Invalid or expired PIN. Please try again.",
                    buttonValue: "OK"
                });
            }
        } catch (error) {
            setMessagebox({
                show: true,
                title: "Connection Error",
                message: "Unable to reach the server. Please try again.",
                buttonValue: "OK"
            });
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setMessagebox({
                show: true,
                title: "Missing Information",
                message: "Please fill in all password fields.",
                buttonValue: "OK"
            });
            return;
        }

        if (newPassword.length < 8) {
            setMessagebox({
                show: true,
                title: "Password Too Short",
                message: "Password must be at least 8 characters long.",
                buttonValue: "OK"
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessagebox({
                show: true,
                title: "Passwords Don't Match",
                message: "Please make sure both passwords match.",
                buttonValue: "OK"
            });
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/care_connect_system/backend/api/resetPassword.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, pin, newPassword })
                }
            );

            const result = await response.json();

            if (result.success) {
                setMessagebox({
                    show: true,
                    title: "Password Reset Successful",
                    message: "Your password has been reset successfully. You can now login with your new password.",
                    buttonValue: "OK"
                });
                
                // Reset form and go back to login
                setEmail("");
                setPin("");
                setNewPassword("");
                setConfirmPassword("");
                setScene("login");
            } else {
                setMessagebox({
                    show: true,
                    title: "Reset Failed",
                    message: result.message || "Unable to reset password. Please try again.",
                    buttonValue: "OK"
                });
            }
        } catch (error) {
            setMessagebox({
                show: true,
                title: "Connection Error",
                message: "Unable to reach the server. Please try again.",
                buttonValue: "OK"
            });
        }
    };

    // ================= GSAP =================
    const landingRef = useRef();
    const loginRef = useRef();
    const forgetRef = useRef();
    const pinRef = useRef();
    const resetPassRef = useRef();

    useEffect(() => {
        // Hide everything first
        gsap.set(
            [landingRef.current, loginRef.current, forgetRef.current, pinRef.current, resetPassRef.current],
            { opacity: 0, display: "none", x: 50 }
        );

        // Show appropriate scene
        if (scene === "landing") showScene(landingRef.current);
        if (scene === "login") showScene(loginRef.current);
        if (scene === "forget") showScene(forgetRef.current);
        if (scene === "pin") showScene(pinRef.current);
        if (scene === "resetPass") showScene(resetPassRef.current);
    }, [scene]);

    const showScene = (target) => {
        gsap.set(target, { display: "flex" });
        gsap.fromTo(
            target,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
        );
    };

    return (
        <>
            <main className="first">
                <div className="upWrapper">

                    {/* ===== LANDING ===== */}
                    <article ref={landingRef}>
                        <h1>Learn. Grow. Achieve.</h1>
                        <p>
                            Care for your mind and emotions.<br />
                            Join us to start tracking, reflecting, and improving your wellbeing.
                        </p>
                        <button onClick={() => setScene("login")}>
                            Get Started!
                        </button>
                    </article>

                    {/* ===== LOGIN ===== */}
                    <article className="viewLoginForm" ref={loginRef}>
                        <h2>UTeM Account Login</h2>
                        <form onSubmit={handleLogin}>
                            <div>
                                <label>Matric Num / Email</label>
                                <input type="text" name="email" placeholder="Enter University Email/ Matric Number" required />
                            </div>
                            <div>
                                <label>Password</label>
                                <input type="password" name="password" placeholder="Enter Password" required />
                            </div>
                            <div>
                                <input type="reset" value="Clear" />
                                <input type="submit" value="Login" />
                            </div>
                            <label
                                className="forgetPassword"
                                onClick={() => setScene("forget")}
                            >
                                Forget Password
                            </label>
                        </form>
                    </article>

                    {/* ===== FORGET PASSWORD - STEP 1 ===== */}
                    <article className="viewLoginForm" ref={forgetRef}>
                        <h2>Reset Password</h2>
                        <form onSubmit={handleForgetPasswordSubmit}>
                            <div>
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter University Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <p>
                                ** You will receive a 6-digit PIN in your email
                            </p>
                            <div>
                                <input type="submit" value="Send PIN" />
                            </div>
                            <label
                                className="forgetPassword"
                                onClick={() => {
                                    setEmail("");
                                    setScene("login");
                                }}
                            >
                                Back to Login
                            </label>
                        </form>
                    </article>

                    {/* ===== VERIFY PIN - STEP 2 ===== */}
                    <article className="viewLoginForm" ref={pinRef}>
                        <h2>Verify PIN</h2>
                        <form onSubmit={handlePinVerification}>
                            <div>
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter University Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="pinWrapper"> 
                                <label>6-Digit PIN</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter 6-Digit PIN" 
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    maxLength={6}
                                    required 
                                />
                            </div>
                            <p>
                                ** Check your email for the PIN
                            </p>
                            <div>
                                <input type="submit" value="Verify PIN" />
                            </div>
                            <label
                                className="forgetPassword"
                                onClick={() => {
                                    setEmail("");
                                    setPin("");
                                    setScene("login");
                                }}
                            >
                                Back to Login
                            </label>
                        </form>
                    </article>

                    {/* ===== RESET PASSWORD - STEP 3 ===== */}
                    <article className="viewLoginForm" ref={resetPassRef}>
                        <h2>Reset Password</h2>
                        <form onSubmit={handleResetPassword}>
                            <div>
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="New Password (min 8 characters)" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={8}
                                    required 
                                />
                            </div>
                            <div>
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter Again New Password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={8}
                                    required 
                                />
                            </div>
                            <div>
                                <input type="submit" value="Reset Password" />
                            </div>
                            <label
                                className="forgetPassword"
                                onClick={() => {
                                    setEmail("");
                                    setPin("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setScene("login");
                                }}
                            >
                                Back to Login
                            </label>
                        </form>
                    </article>

                    <article> 
                        <img src={tuahLogo} alt="UTeM Logo" />
                    </article>
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
            <main className='second'>
                <h1>Are you having a good mood so far ?</h1>
                <article className='emojiWrapper'>
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
                <article className='dialogBox'>
                    <p ref={textRef}>{hoverText}</p>
                </article>
            </main>
        </>
    );
}

function Body3() {
    return(
        <>
            <main className="third">
                <h1>Counselling Unit Information</h1>
                <div className="counsellingInfoWrapper">
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