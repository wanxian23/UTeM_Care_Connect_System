import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";

import {Header, Footer} from "./HeaderFooter";

function Statistic() {

    useEffect(() => {
        document.title = "Statistic";
    }, []);

    return(
        <>
            <Header />
            <Footer />
        </>
    );
}

export default Statistic;