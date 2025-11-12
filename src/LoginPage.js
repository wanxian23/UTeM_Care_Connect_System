import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

import './css/styleB4Login.css';
import './css/Login.css';

import careConnectIcon from './image/careConnectIcon.png';

import { Link } from "react-router-dom";

import {Header, Footer} from "./HeaderFooterB4Login";

function Login() {
    return(
        <>
            <Header />
            <Body />
            <Footer />
        </>
    );
}

function Body() {
    return(
        <>
            <main id="bodyLoginFirst">
                <div id="LoginFirst">
                    <h2>UTeM Account Login</h2>
                    <form>
                        <article>
                            <label>
                                Email Address:
                            </label><br></br>
                            <input type="text"></input>
                        </article>
                        <article>
                            <label>
                                Password:
                            </label><br></br>
                            <input type="text"></input>
                        </article>
                        <article id="buttonWrapper">
                            <input type="reset" value={"Clear"} className="button"></input>
                            <Link to="/Dashboard">
                                <input type="submit" value="Login" className="button"/>
                            </Link>
                        </article>
                    </form>
                </div>
            </main>
        </>  
    );
}

export default Login;