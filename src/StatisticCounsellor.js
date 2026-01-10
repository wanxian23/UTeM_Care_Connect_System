import React, { useState, useEffect } from "react";
import { Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { HeaderCounsellor, Footer } from "./HeaderFooter";
import "./css/statistic.css";

function StatisticCounsellor() {
    useEffect(() => {
        document.title = "Counsellor Statistics";
    }, []);

    const [activeTab, setActiveTab] = useState("moodTrend");
    const [statisticData, setStatisticData] = useState({});
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            window.location.href = "/";
            return;
        }

        const url = `http://localhost:8080/care_connect_system/backend/api/getStatisticCounsellor.php?weekOffset=${weekOffset}&monthOffset=${monthOffset}`;

        fetch(url, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Counsellor Statistic Response:", data);
            
            if (data.success) {
                setStatisticData(data);
            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        })
        .catch(err => console.error("Fetch error:", err));
    }, [weekOffset, monthOffset]);

    return (
        <>
            <HeaderCounsellor />
            <main className="statisticBodyWrapper" style={{ gap: "50px" }}>
                <nav className="statisticNav">
                    <div>
                        <button 
                            className={activeTab === "moodTrend" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("moodTrend")}
                        >
                            Mood & Stress Statistics
                        </button>
                    </div>
                    <div>
                        <button 
                            className={activeTab === "dassTrend" ? "activeBtn" : ""} 
                            onClick={() => setActiveTab("dassTrend")}
                        >
                            DASS-21 Statistics
                        </button>
                    </div>
                </nav>

                {activeTab === "moodTrend" && (
                    <>
                        {/* <FacultyMoodComparison 
                            data={statisticData.weeklyFacultyMood}
                            type="weekly"
                            offset={weekOffset}
                            setOffset={setWeekOffset}
                            weekInfo={statisticData.weekInfo}
                        />
                        <div className="gap"></div> */}
                        <FacultyMoodComparison 
                            data={statisticData.monthlyFacultyMood}
                            type="monthly"
                            offset={monthOffset}
                            setOffset={setMonthOffset}
                            monthInfo={statisticData.monthInfo}
                        />
                        <div className="gap"></div>
                        {/* <FacultyStressComparison 
                            data={statisticData.weeklyFacultyStress}
                            type="weekly"
                            offset={weekOffset}
                            setOffset={setWeekOffset}
                            weekInfo={statisticData.weekInfo}
                        />
                        <div className="gap"></div> */}
                        <FacultyStressComparison 
                            data={statisticData.monthlyFacultyStress}
                            type="monthly"
                            offset={monthOffset}
                            setOffset={setMonthOffset}
                            monthInfo={statisticData.monthInfo}
                        />
                    </>
                )}

                {activeTab === "dassTrend" && (
                    <>
                        {/* <DassTrendGraph 
                            data={statisticData.weeklyDass}
                            type="weekly"
                            category="depression"
                            offset={weekOffset}
                            setOffset={setWeekOffset}
                            weekInfo={statisticData.weekInfo}
                        />
                        <div className="gap"></div>
                        <DassTrendGraph 
                            data={statisticData.weeklyDass}
                            type="weekly"
                            category="anxiety"
                            offset={weekOffset}
                            setOffset={setWeekOffset}
                            weekInfo={statisticData.weekInfo}
                        />
                        <div className="gap"></div>
                        <DassTrendGraph 
                            data={statisticData.weeklyDass}
                            type="weekly"
                            category="stress"
                            offset={weekOffset}
                            setOffset={setWeekOffset}
                            weekInfo={statisticData.weekInfo}
                        /> */}
                        {/* <div className="gap"></div> */}
                        <DassTrendGraph 
                            data={statisticData.monthlyDass}
                            type="monthly"
                            category="depression"
                            offset={monthOffset}
                            setOffset={setMonthOffset}
                            monthInfo={statisticData.monthInfo}
                        />
                        <div className="gap"></div>
                        <DassTrendGraph 
                            data={statisticData.monthlyDass}
                            type="monthly"
                            category="anxiety"
                            offset={monthOffset}
                            setOffset={setMonthOffset}
                            monthInfo={statisticData.monthInfo}
                        />
                        <div className="gap"></div>
                        <DassTrendGraph 
                            data={statisticData.monthlyDass}
                            type="monthly"
                            category="stress"
                            offset={monthOffset}
                            setOffset={setMonthOffset}
                            monthInfo={statisticData.monthInfo}
                        />
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}

// Faculty Mood Comparison Component
function FacultyMoodComparison({ data, type, offset, setOffset, weekInfo, monthInfo }) {
    if (!data) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    }

    const canGoNext = offset < 0;
    const info = type === "weekly" ? weekInfo : monthInfo;

    const chartData = Object.keys(data).map(faculty => ({
        faculty,
        positive: data[faculty].positive,
        neutral: data[faculty].neutral,
        negative: data[faculty].negative,
        totalStudents: data[faculty].totalStudents
    }));

    // Filter out faculties with no students for summary
    const facultiesWithData = chartData.filter(f => f.totalStudents > 0);
    const facultiesWithNegative = facultiesWithData.filter(f => f.negative > 0);
    const facultiesWithPositive = facultiesWithData.filter(f => f.positive > 0);

    // Find worst and best faculty only if there's data
    const worstFaculty = facultiesWithNegative.length > 0
        ? facultiesWithNegative.reduce((prev, curr) =>
            curr.negative > prev.negative ? curr : prev
        )
        : null;

    const bestFaculty = facultiesWithPositive.length > 0
        ? facultiesWithPositive.reduce((prev, curr) =>
            curr.positive > prev.positive ? curr : prev
        )
        : null;


    return (
        <main className="trendBodyWrapper">
            <article className="trendWrapper">
                <h2 className="sectionTitle">
                    {type === "weekly" ? "Weekly Faculty Mood Comparison" : "Monthly Faculty Mood Comparison"}
                </h2>

                <article className="summaryMoodTrend" style={{ marginTop: '30px', width: "70%" }}>
                    {/* <h2 className="sectionTitle">Faculty Mood Summary</h2> */}
                    {facultiesWithData.length > 0 ? (
                        <div className="sectionMoodWrapper" 
                            style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '20px',
                            }}
                            >
                            {worstFaculty && (
                                <section className="moodTrendSection" 
                                    style={{ 
                                        backgroundColor: '#ffebee', 
                                        borderRadius: '10px',
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px"
                                    }}
                                    >
                                    <h3 className="sectionTitle">Faculty with Highest Negative Moods</h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}    
                                    >
                                        <h2 style={{ color: '#d32f2f' }}>{worstFaculty.faculty}</h2>
                                        <h3>{worstFaculty.negative}% Negative Moods</h3>
                                        <p style={{ fontSize: '14px', color: '#666' }}>
                                            Total Students: {worstFaculty.totalStudents}
                                        </p>
                                    </div>
                                </section>
                            )}
                            {bestFaculty && (
                                <section className="moodTrendSection" 
                                    style={{ 
                                        backgroundColor: '#e8f5e9', 
                                        borderRadius: '10px',
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px"
                                    }}
                                >
                                    <h3 className="sectionTitle">Faculty with Highest Positive Moods</h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px"
                                        }}    
                                    >
                                        <h2 style={{ color: '#2e7d32' }}>{bestFaculty.faculty}</h2>
                                        <h3>{bestFaculty.positive}% Positive Moods</h3>
                                        <p style={{ fontSize: '14px', color: '#666' }}>
                                            Total Students: {bestFaculty.totalStudents}
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>No mood data available for any faculty in this period</p>
                        </div>
                    )}
                </article>

                <div className="monthTrendWrapper">
                    <div onClick={() => setOffset(offset - 1)} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                        </svg>
                        {type === "weekly" ? "Prev Week" : "Prev Month"}
                    </div>
                    <h3>{info?.displayText || "Loading..."}</h3>
                    <div onClick={() => canGoNext && setOffset(offset + 1)} 
                         style={{ cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.5 }}>
                        {type === "weekly" ? "Next Week" : "Next Month"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={chartData} margin={{ bottom: 10, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="faculty" height={60}>
                            <Label value="Faculty" offset={0} position="insideBottom" 
                                   style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </XAxis>
                        <YAxis domain={[0, 100]}>
                            <Label
                                value="Percentage (%)"
                                angle={-90}
                                position="insideLeft"
                                dx={0}   // 🔥 move text left (increase/decrease)
                                dy={60}     // fine-tune vertical position
                                style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }}
                            />
                        </YAxis>
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const data = payload[0].payload;
                                if (data.totalStudents === 0) {
                                    return (
                                        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                            <p style={{ margin: '5px 0', color: '#999' }}>No data available</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div 
                                        style={{ 
                                            backgroundColor: 'white', 
                                            padding: '10px', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px' 
                                        }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                        <p style={{ margin: '5px 0', color: '#4CAF50' }}>Positive: {data.positive}%</p>
                                        <p style={{ margin: '5px 0', color: '#FF9800' }}>Neutral: {data.neutral}%</p>
                                        <p style={{ margin: '5px 0', color: '#F44336' }}>Negative: {data.negative}%</p>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                            Total Students: {data.totalStudents}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                backgroundColor: "#f5f6f6ff",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                bottom: "-3%",
                                width: "fit-content",
                                left: "50%",
                                transform: "translateX(-50%)"
                            }}
                        />
                        <Bar dataKey="positive" fill="#b1d5baff" name="Positive Moods (Excited/ Happy)" radius={[6, 6, 0, 0]}/>
                        <Bar dataKey="neutral" fill="#e4b995ff" name="Neutral Moods (Neutral)" radius={[6, 6, 0, 0]}/>
                        <Bar dataKey="negative" fill="#ee7878ff" name="Negative Moods (Sad/ Crying/ Angry/ Anxious/ Annoying)" radius={[6, 6, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>

            </article>
        </main>
    );
}

function FacultyStressComparison({ data, type, offset, setOffset, weekInfo, monthInfo }) {
    if (!data) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    }

    const canGoNext = offset < 0;
    const info = type === "weekly" ? weekInfo : monthInfo;

    const getStressColor = (category) => {
        if (category === 'low') return "#BFE5C8";      // Light green
        if (category === 'moderate') return "#e4b995ff"; // Orange
        return "#ee7878ff";                             // Red
    };

    // Prepare chart data
    const chartData = Object.keys(data).map(faculty => ({
        faculty,
        low: data[faculty].low,
        moderate: data[faculty].moderate,
        high: data[faculty].high,
        totalStudents: data[faculty].totalStudents
    }));

    // Filter out faculties with no students
    const facultiesWithData = chartData.filter(f => f.totalStudents > 0);
    const hasFacultyData = facultiesWithData.length > 0;
    const highestHigh = facultiesWithData.filter(f => f.high > 0)
        .reduce((prev, curr) => curr.high > prev.high ? curr : prev, facultiesWithData[0]) || null;
    const highestModerate = facultiesWithData.filter(f => f.moderate > 0)
        .reduce((prev, curr) => curr.moderate > prev.moderate ? curr : prev, facultiesWithData[0]) || null;
    const highestLow = facultiesWithData.filter(f => f.low > 0)
        .reduce((prev, curr) => curr.low > prev.low ? curr : prev, facultiesWithData[0]) || null;

    // Separate highest cards for each category
    // Determine which faculty to show for high/moderate stress
    const effectiveHighStress = (() => {
        if (!hasFacultyData) return null;

        // Check if any faculty has high stress
        const high = facultiesWithData.filter(f => f.high > 0)
            .reduce((prev, curr) => curr.high > prev.high ? curr : prev, facultiesWithData[0]);
        
        if (high && high.high > 0) return { faculty: high.faculty, value: high.high, type: "high", totalStudents: high.totalStudents };

        // If no high, check moderate
        const moderate = facultiesWithData.filter(f => f.moderate > 0)
            .reduce((prev, curr) => curr.moderate > prev.moderate ? curr : prev, facultiesWithData[0]);
        
        if (moderate && moderate.moderate > 0) return { faculty: moderate.faculty, value: moderate.moderate, type: "moderate", totalStudents: moderate.totalStudents };

        // Neither high nor moderate exists
        return null;
    })();

    return (
        <main className="trendBodyWrapper">
            <article className="trendWrapper">
                <h2 className="sectionTitle">
                    {type === "weekly" ? "Weekly Faculty Stress Comparison" : "Monthly Faculty Stress Comparison"}
                </h2>

                <article className="summaryMoodTrend" style={{ marginTop: "30px", width: "70%" }}>
                    {hasFacultyData ? (
                        <div
                            className="sectionMoodWrapper"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    [highestHigh, highestModerate, highestLow].filter(Boolean).length > 1
                                        ? "1fr 1fr"
                                        : "1fr",
                                gap: "20px",
                            }}
                        >
                            {/* High / Moderate stress card */}
                            {effectiveHighStress && (
                                <section
                                    className="moodStressSection"
                                    style={{
                                        backgroundColor: effectiveHighStress.type === "high" ? "#ffebee" : "#ffebd6ff",
                                        borderRadius: "10px",
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "15px",
                                    }}
                                >
                                    <h3 className="sectionTitle">
                                        {effectiveHighStress.type === "high"
                                            ? "Highest High-Stress Faculty"
                                            : "Highest Moderate-Stress Faculty"}
                                    </h3>
                                    <h2 style={{ color: effectiveHighStress.type === "high" ? "#d32f2f" : "#f57c00" }}>
                                        {effectiveHighStress.faculty}
                                    </h2>
                                    <h3 style={{
                                        backgroundColor: getStressColor(effectiveHighStress.type),
                                        padding: "10px",
                                        borderRadius: "5px",
                                    }}>
                                        {effectiveHighStress.value}% {effectiveHighStress.type === "high" ? "High Stress" : "Moderate Stress"}
                                    </h3>
                                    <p style={{ fontSize: "14px", color: "#666" }}>
                                        Total Students: {effectiveHighStress.totalStudents ?? 0}
                                    </p>
                                </section>
                            )}


                            {/* Low Stress */}
                            {highestLow && (
                                <section
                                    className="moodStressSection"
                                    style={{
                                        backgroundColor: "#e8f5e9",
                                        borderRadius: "10px",
                                        padding: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "15px",
                                    }}
                                >
                                    <h3 className="sectionTitle">Highest Low-Stress Faculty</h3>
                                    <h2 style={{ color: "#2e7d32" }}>{highestLow.faculty}</h2>
                                    <h3 style={{
                                        backgroundColor: getStressColor("low"),
                                        padding: "10px",
                                        borderRadius: "5px",
                                    }}>
                                        {highestLow.low}% Low Stress
                                    </h3>
                                    <p style={{ fontSize: "14px", color: "#666" }}>
                                        Total Students: {highestLow.totalStudents ?? 0}
                                    </p>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <p>No stress data available for any faculty in this period</p>
                        </div>
                    )}
                </article>

                {/* Navigation */}
                <div className="monthTrendWrapper">
                    <div onClick={() => setOffset(offset - 1)} style={{ cursor: 'pointer' }}>
                        ◀ {type === "weekly" ? "Prev Week" : "Prev Month"}
                    </div>
                    <h3>{info?.displayText || "Loading..."}</h3>
                    <div onClick={() => canGoNext && setOffset(offset + 1)} 
                         style={{ cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.5 }}>
                        {type === "weekly" ? "Next Week" : "Next Month"} ▶
                    </div>
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={chartData} margin={{ bottom: 10, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="faculty" height={60}>
                            <Label value="Faculty" offset={0} position="insideBottom" 
                                   style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </XAxis>
                        <YAxis domain={[0, 100]}>
                            <Label
                                value="Percentage (%)"
                                angle={-90}
                                position="insideLeft"
                                dx={0}
                                dy={60}
                                style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }}
                            />
                        </YAxis>

                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const data = payload[0].payload;
                                if (data.totalStudents === 0) {
                                    return (
                                        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                            <p style={{ margin: '5px 0', color: '#999' }}>No data available</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                        {data.low > 0 && <p style={{ margin: '5px 0', color: '#4CAF50' }}>Low Stress: {data.low}%</p>}
                                        {data.moderate > 0 && <p style={{ margin: '5px 0', color: '#FF9800' }}>Moderate Stress: {data.moderate}%</p>}
                                        {data.high > 0 && <p style={{ margin: '5px 0', color: '#F44336' }}>High Stress: {data.high}%</p>}
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                            Total Students: {data.totalStudents}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }} />

                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                backgroundColor: "#f5f6f6ff",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                bottom: "-3%",
                                width: "fit-content",
                                left: "50%",
                                transform: "translateX(-50%)",
                            }}
                        />

                        {chartData.some(d => d.low > 0) && <Bar dataKey="low" fill="#b1d5baff" name="Low Stress (0 - 39)" radius={[6, 6, 0, 0]} />}
                        {chartData.some(d => d.moderate > 0) && <Bar dataKey="moderate" fill="#e4b995ff" name="Moderate Stress (40 - 60)" radius={[6, 6, 0, 0]} />}
                        {chartData.some(d => d.high > 0) && <Bar dataKey="high" fill="#ee7878ff" name="High Stress (61 - 100)" radius={[6, 6, 0, 0]} />}
                    </BarChart>
                </ResponsiveContainer>
            </article>
        </main>
    );
}


// DASS Trend Graph Component - NOW USING CATEGORY PERCENTAGES
function DassTrendGraph({ data, type, category, offset, setOffset, weekInfo, monthInfo }) {
    if (!data || !data[category]) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    }

    const canGoNext = offset < 0;
    const info = type === "weekly" ? weekInfo : monthInfo;
    const categoryData = data[category];
    
    const riskColors = {
        'Normal': '#BFE5C8',
        'Mild': '#d9f2dfff',
        'Moderate': '#e4b995ff',
        'Severe': '#e9b6b6ff',
        'Extremely Severe': '#ee7878ff'
    };

    // Create chart data
    const faculties = ['FTKEK', 'FTKE', 'FTKM', 'FTKIP', 'FTMK', 'FPTT', 'FAIX'];
    const chartData = faculties.map(faculty => {
        const facultyData = categoryData[faculty] || {
            normal: 0,
            mild: 0,
            moderate: 0,
            severe: 0,
            extremelySevere: 0,
            totalStudents: 0
        };
        
        return {
            faculty,
            normal: facultyData.normal,
            mild: facultyData.mild,
            moderate: facultyData.moderate,
            severe: facultyData.severe,
            extremelySevere: facultyData.extremelySevere,
            totalStudents: facultyData.totalStudents
        };
    });

    // Filter faculties with data for summary
    const facultiesWithData = chartData.filter(f => f.totalStudents > 0);
    const hasFacultyData = facultiesWithData.length > 0;
    
    const highestRisk = hasFacultyData
        ? (() => {
            const faculty = facultiesWithData.reduce((prev, curr) => {
                const prevRisk = prev.severe + prev.extremelySevere;
                const currRisk = curr.severe + curr.extremelySevere;
                return currRisk > prevRisk ? curr : prev;
            });
            return (faculty.severe + faculty.extremelySevere) > 0 ? faculty : null;
        })()
        : null;

    const moderateRisk = !highestRisk && hasFacultyData
        ? (() => {
            const faculty = facultiesWithData.reduce((prev, curr) =>
                curr.moderate > prev.moderate ? curr : prev
            );
            return (faculty.moderate + faculty.mild ) > 0 ? faculty : null;
        })()
        : null;

    const lowestRisk = hasFacultyData
        ? (() => {
            const faculty = facultiesWithData.reduce((prev, curr) =>
                curr.normal > prev.normal ? curr : prev
            );
            return faculty.normal > 0 ? faculty : null;
        })()
        : null;

    const effectiveHighestRisk = highestRisk ?? moderateRisk ?? null;
    const isHighRisk = !!highestRisk;
    const isModerateRisk = !highestRisk && !!moderateRisk;
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <main className="trendBodyWrapper">
            <article className="trendWrapper">
                <h2 className="sectionTitle">
                    {type === "weekly" ? `Weekly ${categoryTitle} Levels by Faculty` : `Monthly ${categoryTitle} Levels by Faculty`}
                </h2>

                {/* DASS Summary Section */}
                <article className="summaryMoodTrend" style={{ marginTop: '30px', width: "70%" }}>
                    {hasFacultyData && (effectiveHighestRisk || lowestRisk) ? (
                        <div
                            className="sectionMoodWrapper"
                            style={{
                                display: "grid",
                                gridTemplateColumns: effectiveHighestRisk && lowestRisk ? "1fr 1fr" : "1fr",
                                gap: "20px",
                                width: effectiveHighestRisk && lowestRisk ? "100%" : "50%",
                            }}
                        >
                            {effectiveHighestRisk && (
                                <section
                                    className="moodTrendSection"
                                    style={{
                                        backgroundColor: isHighRisk ? "#ffebee" : "#ffebd6ff",
                                        borderRadius: "10px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                    }}
                                >
                                    <h3 className="sectionTitle">
                                        {isHighRisk ? "Highest Risk Faculty" : "Moderate Risk Faculty"}
                                    </h3>

                                    <h2 style={{ color: isHighRisk ? "#d32f2f" : "#f57c00" }}>
                                        {effectiveHighestRisk.faculty}
                                    </h2>

                                    <h3>
                                        {isHighRisk
                                            ? `${(effectiveHighestRisk.severe ?? 0) + (effectiveHighestRisk.extremelySevere ?? 0)}% Severe / Extremely Severe`
                                            : `${(effectiveHighestRisk.mild ?? 0) + (effectiveHighestRisk.moderate ?? 0)}% Mild / Moderate`}
                                    </h3>

                                    <p style={{ fontSize: "14px", color: "#666" }}>
                                        Total Students: {effectiveHighestRisk.totalStudents ?? 0}
                                    </p>
                                </section>
                            )}

                            {lowestRisk && (
                                <section
                                    className="moodTrendSection"
                                    style={{
                                        backgroundColor: "#e8f5e9",
                                        borderRadius: "10px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                    }}
                                >
                                    <h3 className="sectionTitle">Lowest Risk Faculty</h3>
                                    <h2 style={{ color: "#2e7d32" }}>{lowestRisk.faculty}</h2>
                                    <h3>{lowestRisk.normal}% Normal Levels</h3>
                                    <p style={{ fontSize: "14px", color: "#666" }}>
                                        Total Students: {lowestRisk.totalStudents ?? 0}
                                    </p>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <p>No DASS data available for any faculty in this period</p>
                        </div>
                    )}

                </article>

                <div className="monthTrendWrapper">
                    <div onClick={() => setOffset(offset - 1)} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                        </svg>
                        {type === "weekly" ? "Prev Week" : "Prev Month"}
                    </div>
                    <h3>{info?.displayText || "Loading..."}</h3>
                    <div onClick={() => canGoNext && setOffset(offset + 1)} 
                         style={{ cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.5 }}>
                        {type === "weekly" ? "Next Week" : "Next Month"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={chartData} margin={{ bottom: 10, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="faculty" height={60}>
                            <Label
                                value="Faculty"
                                position="insideBottom"
                                offset={0}
                                style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }}
                            />
                        </XAxis>
                        <YAxis domain={[0, 100]}>
                            <Label
                                value="Percentage (%)"
                                angle={-90}
                                position="insideLeft"
                                dx={0}
                                dy={60}
                                style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }}
                            />
                        </YAxis>
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const data = payload[0].payload;
                                if (data.totalStudents === 0) {
                                    return (
                                        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                            <p style={{ margin: '5px 0', color: '#999' }}>No data available</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.faculty}</p>
                                        <p style={{ margin: '5px 0', backgroundColor: riskColors['Normal'], padding: '5px 10px', borderRadius: '5px' }}>
                                            Normal: {data.normal}%
                                        </p>
                                        <p style={{ margin: '5px 0', backgroundColor: riskColors['Mild'], padding: '5px 10px', borderRadius: '5px' }}>
                                            Mild: {data.mild}%
                                        </p>
                                        <p style={{ margin: '5px 0', backgroundColor: riskColors['Moderate'], padding: '5px 10px', borderRadius: '5px' }}>
                                            Moderate: {data.moderate}%
                                        </p>
                                        <p style={{ margin: '5px 0', backgroundColor: riskColors['Severe'], padding: '5px 10px', borderRadius: '5px' }}>
                                            Severe: {data.severe}%
                                        </p>
                                        <p style={{ margin: '5px 0', backgroundColor: riskColors['Extremely Severe'], padding: '5px 10px', borderRadius: '5px' }}>
                                            Extremely Severe: {data.extremelySevere}%
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                            Total Students: {data.totalStudents}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        
                        {/* <Legend
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                backgroundColor: "#f5f6f6ff",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                bottom: "-3%",
                                width: "fit-content",
                                left: "50%",
                                transform: "translateX(-50%)"
                            }}
                        /> */}
                        
                        <Bar dataKey="normal" fill="#BFE5C8" name="Normal" radius={[6, 6, 0, 0]}  />
                        <Bar dataKey="mild" fill="#d9f2dfff" name="Mild" radius={[6, 6, 0, 0]}  />
                        <Bar dataKey="moderate" fill="#e4b995ff" name="Moderate" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="severe" fill="#e9b6b6ff" name="Severe" radius={[6, 6, 0, 0]}  />
                        <Bar dataKey="extremelySevere" fill="#ee7878ff" name="Extremely Severe" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Risk Level Legend</h4>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: '#BFE5C8', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '14px' }}>Normal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: '#d9f2dfff', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '14px' }}>Mild</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: '#e4b995ff', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '14px' }}>Moderate</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: '#e9b6b6ff', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '14px' }}>Severe</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: '#ee7878ff', borderRadius: '3px' }}></div>
                            <span style={{ fontSize: '14px' }}>Extremely Severe</span>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
}

// Risk Level Tick Component (unchanged from your code)
function RiskLevelTick({ x, y, payload, category, riskLevels, riskColors }) {
    const value = payload.value; // 0–4
    const label = riskLevels[category][value];
    const bgColor = riskColors[label];

    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-110} y={-12} width={80} height={44}>
                <div
                    style={{
                        backgroundColor: bgColor,
                        color: "#333",
                        padding: "3px 6px",
                        borderRadius: "6px",
                        fontSize: "2vh",
                        fontWeight: "600",
                        textAlign: "center"
                    }}
                >
                    {label}
                </div>
            </foreignObject>
        </g>
    );
}

export default StatisticCounsellor;