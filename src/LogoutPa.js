import React, { useState, useEffect, useRef } from "react";

import "./css/Logout.css";
import {HeaderPa, Footer} from "./HeaderFooter";
import MessageBox from "./Modal";

function Logout() {
    
    return(
        <>
            <HeaderPa />
            <LogoutConfirmation />
            <Footer />
        </>
    );
}

function LogoutConfirmation() {

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
        setMessagebox({ ...messagebox, show: false }); // hide modal
        window.location.href = "/";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");

        setMessagebox({
            show: true,
            title: "Logout Successfully",
            message: "Redirecting to main page....",
            buttonValue: "OK",
            redirect: true
        });
    };

    return(
        <>
            <main className="logoutBodyWrapper">
                <h1>Do you confirm that you want to logout?</h1>
                <button onClick={handleLogout}>Logout</button>
                <MessageBox 
                    show={messagebox.show}
                    title={messagebox.title}
                    message={messagebox.message}
                    buttonValue={messagebox.buttonValue}
                    onClose={handleModalButton}
                />
            </main>  
        </>
    );
}
export default Logout;