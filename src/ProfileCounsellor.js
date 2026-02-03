import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {HeaderCounsellor, Footer} from "./HeaderFooter";
import MessageBox, { ConfirmationModal } from "./Modal";

import "./css/profile.css";

function Profile() {

    useEffect(() => {
        document.title = "Profile";
    }, []);

    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch(`${process.env.REACT_APP_API_BASE_URL}/getProfilePa.php`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setProfileData(data);
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
            <Body1 data={profileData}/>
            <Footer />
        </>
    );
}

function Body1({data}) {
    // Add [] means that below is a boolean not an array
    const [isClicked, setIsClicked] = useState(false);
    const formBoxRef = useRef();
    const buttonRef = useRef();

    const [redirectLocation, setRedirectLocation] = useState("");


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


    // Password Matching Checking
    const [password, setPassword] = useState(null);
    const [rePassword, setRePassword] = useState(null);

    // For form handling and messageBox (Modal)
    const [confirmationBox, setConfirmationBox] = useState({
        show: false,
        title: "",
        message: "",
        confirmText: "",
        cancelText: "",
        onConfirm: null,
        onCancel: null
    });

    // For form handling and messageBox (Modal)
    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const handleLogout = () => {
        setConfirmationBox({
            show: true,
            title: "Logout Confirmation",
            message: "Are you sure you wanna logout?",
            confirmText: "Logout",
            cancelText: "Cancel",
            onConfirm: () => {

                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                localStorage.removeItem("userId");

                setConfirmationBox({show: false});

                setRedirectLocation("/");

                setMessagebox({
                    show: true,
                    title: "Logout Successfully",
                    message: "Redirecting...",
                    buttonValue: "OK",
                    redirect: true
                });

            },
            onCancel: () =>
                setConfirmationBox(prev => ({ ...prev, show: false }))
        });
    };

    const token = localStorage.getItem("token");


    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (password !== rePassword) {
             setMessagebox({
                show: true,
                title: "Password Matching Error",
                message: "Password and Re-Enter Password Must Be The Same!",
                buttonValue: "OK",
                redirect: false
            });    

            return;
        } else {

            const formData = new FormData(e.target);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/changePasswordPa.php`, {
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
                    title: "Password Changed Successful",
                    message: result.message,
                    buttonValue: "OK",
                    redirect: true
                });
            } else {
                setMessagebox({
                    show: true,
                    title: "Password Changed Failed",
                    message: result.message,
                    buttonValue: "Try Again",
                    redirect: false
                });
            }
        }
        
        setRedirectLocation("/ProfilePa");
    };

    // Modal button click handler → put this inside the component
    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect; // Capture current value first
        setMessagebox({ ...messagebox, show: false }); // hide modal
        if (shouldRedirect) {
            window.location.href = redirectLocation;
        }
    };

    if (!data) return (
        <main id="mainProfileFirst">
            <p>Loading...</p>
        </main>
    );

    return(
        <>
            <main id="mainProfileFirst">
                <div className="profileWrapper">
                    <h2>Personal Information</h2>
                    <div id="profileContentWrapper">
                        <div id="profileImg">{data.name[0]}</div>
                        <section id="personalInfoWrapper">
                            <aside>
                                <label>Name:</label>
                                <p>{data.name}</p>
                            </aside>
                            <aside>
                                <label>Email:</label>
                                <p>{data.email}</p>
                            </aside>
                            <aside>
                                <label>Contact:</label>
                                <p>{data.contact}</p>
                            </aside>
                            <aside>
                                <label>Faculty:</label>
                                <p>{data.faculty}</p>
                            </aside>
                            <aside>
                                <label>Office:</label>
                                <p>{data.office}</p>
                            </aside>
                            <aside>
                                <label>Role:</label>
                                <p>{data.role}</p>
                            </aside>
                            <aside>
                                <label>Member Since:</label>
                                <p>{data.memberSince}</p>
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
                            <form ref={formBoxRef} onSubmit={handleChangePassword}>
                                <aside>
                                    <label>New Password:</label>
                                    <input type="password" placeholder="New Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                                </aside>
                                <aside>
                                    <label>Type Again Password:</label>
                                    <input type="password" placeholder="Type Again New Password" name="rePass" value={rePassword} onChange={(e) => setRePassword(e.target.value)} required></input>
                                </aside>
                                <aside>
                                    <button>Save</button>
                                </aside>
                            </form>
                        </section>
                    </div>
                </div>
                <div className="profileWrapper">
                    <button onClick={() => handleLogout()}>Logout</button>
                </div>
            </main>
            <ConfirmationModal
                show={confirmationBox.show}
                title={confirmationBox.title}
                message={confirmationBox.message}
                confirmText={confirmationBox.confirmText}
                cancelText={confirmationBox.cancelText}
                onConfirm={confirmationBox.onConfirm}
                onCancel={confirmationBox.onCancel}
            />
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

export default Profile;