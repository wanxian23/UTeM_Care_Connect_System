import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";

import "./css/StudentInfo.css";
import {HeaderPa, Footer} from "./HeaderFooter";

function StatisticPa() {

    useEffect(() => {
        document.title = "Statistic";
    }, []);
    
    return(
        <>
            <HeaderPa />
            <Footer />
        </>  
    );
}

export default StatisticPa;