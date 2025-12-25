import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import "./css/StudentInfo.css";
import {HeaderPa, Footer} from "./HeaderFooter";

function StatisticPa() {

    useEffect(() => {
        document.title = "Statistic";
    }, []);
    
    return(
        <>
            <HeaderPa />
            <SubHeader />
            <Footer />
        </>  
    );
}

function SubHeader() {

    return(
        <>
            <main id="MoodRecordSubHeaderWrapper">
            <NavLink
                to="/StudentTableData"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader leftSelected" : "subButton"
                }
            >
            Table Data
            </NavLink>

            <NavLink
                to="/StatisticPa"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader rightSelected" : "subButton"
                }
            >
            Graph/ Chart
            </NavLink>
            </main>
        </>
    );
}

export default StatisticPa;