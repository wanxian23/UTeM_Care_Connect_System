import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

import "./css/StudentInfo.css";
import {HeaderPa, Footer} from "./HeaderFooter";
import {TrendGraph, StressTrendGraph} from "./Statistic";

function StudentInfo() {

    useEffect(() => {
        document.title = "Statistic Student";
    }, []);

    const { id } = useParams();

    const [statisticData, setStatisticData] = useState({});
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

    useEffect(() => {
        console.log("useEffect triggered - fetching data...");
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        
        if(!token){
            console.log("No token found, redirecting to login");
            window.location.href = "/";
            return;
        }

        const url = `${process.env.REACT_APP_API_BASE_URL}/getStatisticPa.php?studentId=${id}&weekOffset=${weekOffset}&monthOffset=${monthOffset}`;
        console.log("Fetching from:", url);

        fetch(url, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        })
        .then(res => {
            console.log("Response received, status:", res.status);
            return res.json();
        })
        .then(data => {
            console.log("Statistic Response:", data);
            
            if(data.success){
                setStatisticData(data);
                console.log("Data set successfully");
            } else {
                console.log("Response not successful, clearing storage");
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
        });
    }, [weekOffset, monthOffset]);

    const [activeTab, setActiveTab] = useState("moodTrend");

    return(
        <>
            <HeaderPa />
            <main className="studentInfoContentMain">
                <SubHeader studentId={id} />
                <section className="studentInfoContentWrapper">
                    <nav className="statisticNav">
                        <div>
                            <button 
                                className={activeTab === "moodTrend" ? "activeBtn" : ""} 
                                onClick={() => setActiveTab("moodTrend")}
                            >
                                Mood Trend View
                            </button>
                        </div>
                        <div>
                            <button 
                                className={activeTab === "stressTrend" ? "activeBtn" : ""} 
                                onClick={() => setActiveTab("stressTrend")}
                            >
                                Stress Trend View
                            </button>
                        </div>
                    </nav>
                    <main className="statisticBodyWrapper">
                        {activeTab === "moodTrend" && (
                            <>
                                <TrendGraph 
                                    trendData={statisticData.weeklyTrend} 
                                    type="weekly"
                                    offset={weekOffset}
                                    setOffset={setWeekOffset}
                                    weekInfo={statisticData.weekInfo}
                                    summary={statisticData.weeklySummary}
                                    moodComparison={statisticData.weeklyMoodComparison} // NEW
                                    comparisonInfo={statisticData.comparisonInfo?.weeklyComparison} // NEW
                                />
                                <div className="gap"></div>
                                <TrendGraph 
                                    trendData={statisticData.monthlyTrend} 
                                    type="monthly"
                                    offset={monthOffset}
                                    setOffset={setMonthOffset}
                                    monthInfo={statisticData.monthInfo}
                                    summary={statisticData.monthlySummary}
                                    moodComparison={statisticData.monthlyMoodComparison} // NEW
                                    comparisonInfo={statisticData.comparisonInfo?.monthlyComparison} // NEW
                                />
                                <div></div>
                            </>
                        )}
                        {activeTab === "stressTrend" && (
                            <>
                                <StressTrendGraph 
                                    stressData={statisticData.weeklyStressTrend} 
                                    type="weekly"
                                    offset={weekOffset}
                                    setOffset={setWeekOffset}
                                    weekInfo={statisticData.weekInfo}
                                    stressSummary={statisticData.weeklyStressSummary}
                                    stressComparison={statisticData.weeklyStressComparison} // NEW
                                    comparisonInfo={statisticData.comparisonInfo?.weeklyComparison} // NEW
                                />
                                <div className="gap"></div>
                                <StressTrendGraph 
                                    stressData={statisticData.monthlyStressTrend} 
                                    type="monthly"
                                    offset={monthOffset}
                                    setOffset={setMonthOffset}
                                    monthInfo={statisticData.monthInfo}
                                    stressSummary={statisticData.monthlyStressSummary}
                                    stressComparison={statisticData.monthlyStressComparison} // NEW
                                    comparisonInfo={statisticData.comparisonInfo?.monthlyComparison} // NEW
                                />
                                <div></div>
                            </>
                        )}
                    </main>
                </section>
            </main>
            {/* <Footer /> */}
        </>
    );
}

function SubHeader({studentId}) {

    return(
        <>
            <aside className="studentInfoAsideWrapper">
                <NavLink
                    to={"/StudentInfo/"+studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader studentInfo" : "subButton"
                    }
                >
                Student Information
                </NavLink>

                <NavLink
                    to={"/StudentInfoStatistic/"+studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader trendView" : "subButton"
                    }
                >
                Trend View
                </NavLink>
                <NavLink
                    to={"/StudentContactHistory/"+studentId}
                    className={({ isActive }) =>
                        isActive ? "subButton selectedSubHeader contactHistory" : "subButton"
                    }
                >
                Contact History
                </NavLink>
            </aside>
        </>
    );
}

export default StudentInfo;