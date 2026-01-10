import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import {Header, Footer} from "./HeaderFooter";
import { NavLink } from "react-router-dom";
import "./css/statistic.css";

function Statistic() {
    
    useEffect(() => {
        document.title = "Statistic";
    }, []);

    // Control SubHeader
    const [activeTab, setActiveTab] = useState("moodTrend");
    const [selected, setSelected] = useState([]); // ✅ Move selected state here


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

        const url = `http://localhost:8080/care_connect_system/backend/api/getStatistic.php?weekOffset=${weekOffset}&monthOffset=${monthOffset}`;
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

    return(
        <>
            <Header />
            <main className="statisticBodyWrapper">
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
            <Footer />
        </>
    );
}

export function TrendGraph({ trendData, type, offset, setOffset, weekInfo, monthInfo, summary, moodComparison, comparisonInfo }) {
    const moodLabelMap = {
        1: "Excited", 2: "Happy", 3: "Neutral", 4: "Sad",
        5: "Crying", 6: "Angry", 7: "Anxious", 8: "Annoying"
    };

    const moodColorMap = {
        1: "#F9F594", 2: "#F8B8D2", 3: "#8DCFB0", 4: "#A6E0F5",
        5: "#9EBBDB", 6: "#ff5558ff", 7: "#835acbff", 8: "#CBA8D0"
    };

    const fontMoodColorMap = {
        1: "black", 2: "black", 3: "black", 4: "black",
        5: "black", 6: "black", 7: "white", 8: "black"
    };

    const moodMap = {
        1: { label: "Excited", img: "/EmotionCuteEmoji/4.png" },
        2: { label: "Happy", img: "/EmotionCuteEmoji/1.png" },
        3: { label: "Neutral", img: "/EmotionCuteEmoji/10.png" },
        4: { label: "Sad", img: "/EmotionCuteEmoji/11.png" },
        5: { label: "Crying", img: "/EmotionCuteEmoji/7.png" },
        6: { label: "Angry", img: "/EmotionCuteEmoji/6.png" },
        7: { label: "Anxious", img: "/EmotionCuteEmoji/12.png" },
        8: { label: "Annoying", img: "/EmotionCuteEmoji/13.png" }
    };

    const MoodImageTick = ({ x, y, payload }) => {
        const mood = moodMap[payload.value];
        if (!mood) return null;
        return (
            <g transform={`translate(${x},${y})`}>
                <image href={mood.img} x={-90} y={-12} width={24} height={24} className="yaxisIcon" />
                <text x={-15} y={6} textAnchor="end" fontSize={12} fill="#555" className="yaxisText">{mood.label}</text>
            </g>
        );
    };

    if (!trendData) {
        return <main className="trendBodyWrapper"><div style={{padding:'50px',textAlign:'center'}}>Loading...</div></main>;
    }

    const dayKeys = type === "weekly" ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : Array.from({ length: 31 }, (_, i) => String(i+1).padStart(2,'0'));

    const chartData = dayKeys.flatMap(day => {
        const moods = trendData[day];
        if (!Array.isArray(moods) || moods.length === 0) return [];
        
        return moods.map((m, i) => ({
            day,
            Mood: m.moodTypeId,
            xKey: moods.length === 1 
                ? day 
                : `${day}-${i + 1}` // "Wed-1", "Wed-2"
        }));
    });

    const chartDataWithIndex = chartData.map((item, idx) => {
        // Only show label on the "main" position (e.g., "Wed", or "Wed-1")
        const displayLabel = item.xKey === item.day || item.xKey.endsWith('-1')
            ? item.day
            : ''; // hide label for second entry

        return { ...item, index: idx, displayLabel };
    });

    const xLabelMap = {};
    chartDataWithIndex.forEach(d => {
        xLabelMap[d.xKey] = d.displayLabel;
    });


    const CustomDot = ({ cx, cy, payload }) => {
        if (!payload || !payload.Mood) return null;
        return <circle cx={cx} cy={cy} r={5} fill={moodColorMap[payload.Mood] || "#999"} stroke="#fff" strokeWidth={1.5} />;
    };

    const CustomMoodLine = ({ points }) => {
        if (!points || points.length < 2) return null;
        return (
            <g>
                {points.map((point, idx) => {
                    if (idx === 0) return null;
                    const prevPoint = points[idx - 1];
                    const prevMood = chartDataWithIndex[idx - 1]?.Mood;
                    return <line key={`line-${idx}`} x1={prevPoint.x} y1={prevPoint.y} x2={point.x} y2={point.y} stroke={moodColorMap[prevMood] || "#999"} strokeWidth={3} fill="none" />;
                })}
            </g>
        );
    };

    const CustomXAxisTick = ({ x, y, payload }) => {
        const label = xLabelMap[payload.value];

        if (!label) return null;

        return (
            <text
                x={x}
                y={y + 15}
                textAnchor="middle"
                fill="#555"
                fontSize={12}
                fontWeight="bold"
            >
                {label}
            </text>
        );
    };

    const canGoNext = offset < 0;
    const info = type === "weekly" ? weekInfo : monthInfo;

    return (
        <main className="trendBodyWrapper">
            <article className="trendWrapper">
                <h2 className="sectionTitle">{type === "weekly" ? "Weekly Mood Trend" : "Monthly Mood Trend"}</h2>

                <article className="summaryMoodTrend"
                    style={{
                        width: "100%",
                    }}
                >
                    
                    {summary ? (
                        <div className="sectionMoodWrapper"
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            {/* NEW: Add comparison display at the top of summary */}
                            {/* {moodComparison && ( */}
                                <>
                                    <MoodComparisonDisplay 
                                        comparison={moodComparison} 
                                        period={type === "weekly" ? "week" : "month"} 
                                    />
                                    {/* <div style={{ margin: '30px 0', borderBottom: '2px solid #e0e0e0' }}></div> */}
                                </>
                            {/* )} */}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>No mood data available for this period</p>
                        </div>
                    )}
                </article>

                <div className="monthTrendWrapper">
                    <div onClick={() => setOffset(offset - 1)} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg>
                        {type === "weekly" ? "Prev Week" : "Prev Month"}
                    </div>
                    <h3>{info?.displayText || "Loading..."}</h3>
                    <div onClick={() => canGoNext && setOffset(offset + 1)} style={{ cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.5 }}>
                        {type === "weekly" ? "Next Week" : "Next Month"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={chartDataWithIndex}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="xKey"
                            height={60}
                            fontSize={20}
                            tick={<CustomXAxisTick />}
                        >
                            <Label value={type === "weekly" ? "Day of Week" : "Day of Month"} offset={0} position="insideBottom" style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </XAxis>
                        <YAxis 
                            domain={[1, 8]} 
                            ticks={[1,2,3,4,5,6,7,8]} 
                            tick={<MoodImageTick />} 
                            width={135} 
                            fontSize={20}
                            reversed={true}
                        >
                            <Label value="Mood" offset={2} angle={-90} position="insideLeft" style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </YAxis>
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const day = payload[0].payload.day;
                                const moodId = payload[0].payload.Mood;
                                return (
                                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{type === "weekly" ? day : `Day: ${day}`}</p>
                                        <p style={{ margin: '5px 0 0 0', backgroundColor: moodColorMap[moodId], padding: "5px 10px", borderRadius: "10px", color: fontMoodColorMap[moodId]}}>Mood: {moodLabelMap[moodId]}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Line type="monotone" dataKey="Mood" stroke="transparent" strokeWidth={3} shape={<CustomMoodLine />} dot={<CustomDot />} activeDot={{ r: 7 }} connectNulls={false} />
                    </LineChart>
                </ResponsiveContainer>
            </article>
            <article className="summaryMoodTrend">
                <h2 className="sectionTitle">{type === "weekly" ? "Summary of Weekly Mood Trend" : "Summary of Monthly Mood Trend"}</h2>
                {summary ? (
                    <div className="sectionMoodWrapper">
                        <section className="moodTrendSection">
                            <h3 className="sectionTitle">Most Frequent Mood</h3>
                            <div>
                                <img src={moodMap[summary.mostFrequentMood.moodId]?.img} alt={summary.mostFrequentMood.moodName} />
                                <h3>{summary.mostFrequentMood.moodName}</h3>
                                <h3>Recorded Count: {summary.mostFrequentMood.count}</h3>
                            </div>
                        </section>
                        {/* <section className="moodTrendSection">
                            <h3 className="sectionTitle">Mood Balance</h3>
                            <div className="outerWrapper">
                                <div><h3 style={{backgroundColor: "#BFE5C8"}}>Positive</h3><h3>{summary.moodBalance.positive}%</h3></div>
                                <div><h3 style={{backgroundColor: "#e4b995ff"}}>Neutral</h3><h3>{summary.moodBalance.neutral}%</h3></div>
                                <div><h3 style={{backgroundColor: "#ee7878ff"}}>Negative</h3><h3>{summary.moodBalance.negative}%</h3></div>
                            </div>
                            <h3 className="sectionTitle">Categories Explain (legend)</h3>
                            <div className="legendOuterWrapper">
                                <div className="legendInnerWrapper" style={{backgroundColor: "#BFE5C8"}}>
                                    <h4>Positive</h4>
                                    <div>
                                        <span>Excited</span>
                                        <span>Happy</span>
                                    </div>
                                </div>
                                <div className="legendInnerWrapper" style={{backgroundColor: "#e4b995ff"}}>
                                    <h4>Neutral</h4>
                                    <div>
                                        <span>Neutral</span>
                                    </div>
                                </div>
                                <div className="legendInnerWrapper" style={{backgroundColor: "#ee7878ff"}}>
                                    <h4>Negative</h4>
                                    <div>
                                        <span>Sad</span>
                                        <span>Crying</span>
                                        <span>Angry</span>
                                        <span>Anxious</span>
                                        <span>Annoying</span>
                                    </div>
                                </div>
                            </div>
                        </section> */}
                        <section className="moodTrendSection">
                            <h3 className="sectionTitle">Time-Based Insight</h3>
                            <div className="outerWrapper">
                                {summary.timeBasedInsight.morning && <div><h3>Morning</h3><h3 style={{ backgroundColor: summary.timeBasedInsight.morning.includes('Positive') ? '#BFE5C8' : summary.timeBasedInsight.morning.includes('Negative') ? '#ee7878ff' : '#e4b995ff' }}>{summary.timeBasedInsight.morning}</h3></div>}
                                {summary.timeBasedInsight.afternoon && <div><h3>Afternoon</h3><h3 style={{ backgroundColor: summary.timeBasedInsight.afternoon.includes('Positive') ? '#BFE5C8' : summary.timeBasedInsight.afternoon.includes('Negative') ? '#ee7878ff' : '#e4b995ff' }}>{summary.timeBasedInsight.afternoon}</h3></div>}
                                {summary.timeBasedInsight.evening && <div><h3>Evening</h3><h3 style={{ backgroundColor: summary.timeBasedInsight.evening.includes('Positive') ? '#BFE5C8' : summary.timeBasedInsight.evening.includes('Negative') ? '#ee7878ff' : '#e4b995ff' }}>{summary.timeBasedInsight.evening}</h3></div>}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><p>No mood data available for this period</p></div>
                )}
            </article>
        </main>
    );
}

export function StressTrendGraph({ stressData, type, offset, setOffset, weekInfo, monthInfo, stressSummary, stressComparison, comparisonInfo }) {
    if (!stressData) {
        return <main className="trendBodyWrapper"><div style={{padding:'50px',textAlign:'center'}}>Loading...</div></main>;
    }

    const safeStressData = stressData || {};
    const chartData = Object.keys(safeStressData).filter(day => safeStressData[day] !== null).sort((a, b) => {
        if (type === "weekly") {
            const dayOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        }
        return parseInt(a) - parseInt(b);
    }).map(day => ({ day, Stress: safeStressData[day] }));

    const getStressColor = (value) => {
        if (value <= 20) return "#BFE5C8";
        if (value <= 40) return "#d9f2dfff";
        if (value <= 60) return "#e4b995ff";
        if (value <= 80) return "#e9b6b6ff";
        return "#ee7878ff";
    };

    const CustomLine = ({ points }) => {
        if (!points || points.length < 2) return null;
        return (
            <g>
                {points.map((point, idx) => {
                    if (idx === 0) return null;
                    const prevPoint = points[idx - 1];
                    const avgStress = (chartData[idx]?.Stress + chartData[idx - 1]?.Stress) / 2;
                    return <line key={`line-${idx}`} x1={prevPoint.x} y1={prevPoint.y} x2={point.x} y2={point.y} stroke={getStressColor(avgStress)} strokeWidth={3} fill="none" />;
                })}
            </g>
        );
    };

    const canGoNext = offset < 0;
    const info = type === "weekly" ? weekInfo : monthInfo;

    return (
        <main className="trendBodyWrapper">
            <article className="trendWrapper">
                <h2 className="sectionTitle">{type === "weekly" ? "Weekly Stress Trend" : "Monthly Stress Trend"}</h2>
                
                <article className="summaryMoodTrend"
                    style={{
                        width: "100%",
                    }}
                >
                    {/* <h2 className="sectionTitle">
                        {type === "weekly" ? "Summary of Weekly Stress Level Trend" : "Summary of Monthly Stress Level Trend"}
                    </h2> */}
                    
                    {stressSummary ? (
                        <div className="sectionMoodWrapper"
                            style={{
                                width: "60%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            {/* NEW: Add comparison display at the top of summary */}
                            {/* {stressComparison && ( */}
                                <>
                                    <StressComparisonDisplay 
                                        comparison={stressComparison} 
                                        period={type === "weekly" ? "week" : "month"} 
                                    />
                                    {/* <div style={{ margin: '30px 0', borderBottom: '2px solid #e0e0e0' }}></div> */}
                                </>
                            {/* )} */}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>No stress data available for this period</p>
                        </div>
                    )}
                </article>
            
                <div className="monthTrendWrapper">
                    <div onClick={() => setOffset(offset - 1)} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg>
                        {type === "weekly" ? "Prev Week" : "Prev Month"}
                    </div>
                    <h3>{info?.displayText || "Loading..."}</h3>
                    <div onClick={() => canGoNext && setOffset(offset + 1)} style={{ cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.5 }}>
                        {type === "weekly" ? "Next Week" : "Next Month"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" height={60}>
                            <Label value={type === "weekly" ? "Day of Week" : "Day of Month"} offset={0} position="insideBottom" style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </XAxis>
                        <YAxis domain={[0, 100]} width={70}>
                            <Label value="Stress Level" offset={2} angle={-90} position="insideLeft" style={{ fill: "#555", fontSize: "3.5vh", fontWeight: "bold" }} />
                        </YAxis>
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                const day = payload[0].payload.day;
                                const stress = payload[0].payload.Stress;
                                return (
                                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{type === "weekly" ? day : `Day: ${day}`}</p>
                                        <p style={{ margin: '5px 0 0 0', backgroundColor: getStressColor(stress), padding: "5px 10px", borderRadius: "10px" }}>Stress Level: {stress}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Line type="monotone" dataKey="Stress" stroke="transparent" strokeWidth={3} shape={<CustomLine />} dot={(props) => {
                            if (!props.payload || props.payload.Stress === null) return null;
                            return <circle cx={props.cx} cy={props.cy} r={5} fill={getStressColor(props.payload.Stress)} stroke="#fff" strokeWidth={1.5} />;
                        }} activeDot={{ r: 7 }} connectNulls={false} />
                    </LineChart>
                </ResponsiveContainer>
            </article>
            <article className="summaryMoodTrend">
                <h2 className="sectionTitle">{type === "weekly" ? "Summary of Weekly Stress Level Trend" : "Summary of Monthly Stress Level Trend"}</h2>
                {stressSummary ? (
                    <div className="sectionMoodWrapper">
                        <section className="moodStressSection">
                            <h3 className="sectionTitle">Avg Stress Level</h3>
                            <div>
                                <h3 className="avgStress" style={{ backgroundColor: getStressColor(stressSummary.avgStress) }}>{stressSummary.avgStress}%</h3>
                                <h3>{stressSummary.avgStressLevel}</h3>
                            </div>
                        </section>
                        <section className="moodStressSection">
                            <h3 className="sectionTitle">Peak Stress Day</h3>
                            <div>
                                <h3>{stressSummary.peakStressDays.join(' & ')}</h3>
                                <h3 className="stressStatus" style={{ backgroundColor: stressSummary.peakStressLevel.includes('Very Low') ? '#BFE5C8' : stressSummary.peakStressLevel.includes('Low') && !stressSummary.peakStressLevel.includes('Very') ? '#d9f2dfff' : stressSummary.peakStressLevel.includes('Moderate') ? '#e4b995ff' : stressSummary.peakStressLevel.includes('High') && !stressSummary.peakStressLevel.includes('Very') ? '#e9b6b6ff' : '#ee7878ff' }}>{stressSummary.peakStressLevel}</h3>
                            </div>
                        </section>
                        <section className="moodStressSection">
                            <h3 className="sectionTitle">Stress Consistency</h3>
                            <div className="outerWrapper">
                                <div><h3 style={{ backgroundColor: stressSummary.stressConsistency === 'Stable' ? '#BFE5C8' : stressSummary.stressConsistency === 'Moderate Fluctuations' ? '#e4b995ff' : '#ee7878ff' }}>{stressSummary.stressConsistency}</h3></div>
                            </div>
                        </section>
                    </div>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><p>No stress data available for this period</p></div>
                )}
            </article>
        </main>
    );
}

// Add this component to display mood comparison
export function MoodComparisonDisplay({ comparison, period = "week" }) {
    if (!comparison) {
        return <div className="comparisonMessage">No comparison data available</div>;
    }

    const getArrowIcon = (trend) => {
        if (trend === 'increasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                    <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                </svg>
            );
        } else if (trend === 'decreasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash" viewBox="0 0 16 16">
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                </svg>
            );
        }
    };

    const getTrendColor = (category, trend) => {
        if (category === 'positive') {
            return trend === 'increasing' ? '#4CAF50' : trend === 'decreasing' ? '#ff1111' : '#757575';
        } else if (category === 'negative') {
            return trend === 'decreasing' ? '#4CAF50' : trend === 'increasing' ? '#ff1111' : '#757575';
        }
        return '#757575';
    };

    const getOverallMessage = () => {
        const { overallTrend } = comparison;
        if (overallTrend === 'improving') {
            return { text: 'Your mood is showing positive improvement', color: '#4CAF50' };
        } else if (overallTrend === 'declining') {
            return { text: 'Your mood balance has changed', color: '#ff1111' };
        }
        return { text: 'Your mood remains stable', color: '#2196F3' };
    };

    const overallMessage = getOverallMessage();

    return (
        <section className="moodComparisonSection"
            style={{
                width: "100%",
                display: "flex",
                gap: "30px",
                backgroundColor: "transparent"
            }}
        >
            {/* <h3 className="sectionTitle">Comparison with Previous {period === 'week' ? 'Week' : 'Month'}</h3> */}

            <div className="comparisonGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: "100%" }}>
                {/* Positive Comparison */}
                <div className="comparisonCard" style={{ backgroundColor: '#BFE5C8', padding: '15px', borderRadius: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '17px' }} 
                        // className="sectionTitle titleLegend1"
                    >Positive Moods</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison.positive.current}%</span>
                        <span style={{ 
                            fontSize: '14px', 
                            color: getTrendColor('positive', comparison.positive.trend),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: "white",
                            padding: " 1px 5px",
                            borderRadius: "15px"
                        }}>
                            {getArrowIcon(comparison.positive.trend)}
                            {Math.abs(comparison.positive.difference)}%
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                        Previous: {comparison.positive.previous}%
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#8fcb9dff",
                            width: "100%",
                            borderRadius: "15px"
                        }}
                    >
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }} className="sectionTitle legend1">Positive Moods Category</h4>
                        <div style={{ display: 'flex', flexDirection: "row", justifyContent: 'center', gap: '13px', marginBottom: '5px', width: "100%" }}>
                            <h4>Excited</h4>
                            <h4>Happy</h4>
                        </div>
                    </div>
                </div>

                {/* Neutral Comparison */}
                <div className="comparisonCard" style={{ backgroundColor: '#e4b995ff', padding: '15px', borderRadius: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '17px' }} 
                        // className="sectionTitle titleLegend2"
                    >Neutral Moods</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{comparison.neutral.current}%</span>
                        <span style={{ 
                            fontSize: '14px', 
                            color: '#757575',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: "white",
                            padding: " 1px 5px",
                            borderRadius: "15px"
                        }}>
                            {getArrowIcon(comparison.neutral.trend)}
                            {Math.abs(comparison.neutral.difference)}%
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                        Previous: {comparison.neutral.previous}%
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#d39b6eff",
                            width: "100%",
                            borderRadius: "15px"
                        }}
                    >
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }} className="sectionTitle legend2">Neutral Moods Category</h4>
                        <div style={{ display: 'flex', flexDirection: "row", justifyContent: 'center', gap: '8px', marginBottom: '5px', width: "100%" }}>
                            <h4>Neutral</h4>
                        </div>
                    </div>
                </div>

                {/* Negative Comparison */}
                <div className="comparisonCard" style={{ backgroundColor: '#ee7878ff', padding: '15px', borderRadius: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '17px' }}
                        // className="sectionTitle titleLegend3"
                    >Negative Moods</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold'}}>{comparison.negative.current}%</span>
                        <span style={{ 
                            fontSize: '14px', 
                            color: getTrendColor('negative', comparison.negative.trend),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: "white",
                            padding: " 1px 5px",
                            borderRadius: "15px"
                        }}>
                            {getArrowIcon(comparison.negative.trend)}
                            {Math.abs(comparison.negative.difference)}%
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px' }}>
                        Previous: {comparison.negative.previous}%
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#d74f4fff",
                            width: "100%",
                            borderRadius: "15px"
                        }}
                    >
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }} className="sectionTitle legend3">Negative Moods Category</h4>
                        <div style={{ display: 'flex', flexDirection: "row", justifyContent: 'center', gap: '13px', marginBottom: '5px', width: "100%" }}>
                            <h4>Sad</h4>
                            <h4>Crying</h4>
                            <h4>Angry</h4>
                            <h4>Anxious</h4>
                            <h4>Annoying</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overallTrendMessage" 
                style={{ 
                    backgroundColor: 
                    overallMessage.color + '20', 
                    borderLeft: `4px solid ${overallMessage.color}`, 
                    padding: '15px', borderRadius: '12px', width: "100%" 
                }}>
                <p style={{ margin: 0, color: overallMessage.color, fontWeight: 'bold' }}>{overallMessage.text}</p>
            </div>
        </section>
    );
}

// Add this component to display stress comparison
export function StressComparisonDisplay({ comparison, period = "week" }) {
    if (!comparison) {
        return <div className="comparisonMessage">No comparison data available</div>;
    }

    const getStressColor = (value) => {
        if (value <= 20) return "#BFE5C8";
        if (value <= 40) return "#d9f2dfff";
        if (value <= 60) return "#e4b995ff";
        if (value <= 80) return "#e9b6b6ff";
        return "#ee7878ff";
    };

    const getArrowIcon = (trend) => {
        if (trend === 'increasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
                </svg>
            );
        } else if (trend === 'decreasing') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
            );
        }
    };

    const getInterpretationMessage = () => {
        const { trend, interpretation, difference } = comparison;
        
        if (interpretation === 'minimal_change') {
            return { 
                text: 'Your stress level remains relatively stable',
                color: '#2196F3'
            };
        } else if (interpretation === 'moderate_change') {
            if (trend === 'decreasing') {
                return { 
                    text: 'Your stress level shows moderate improvement',
                    color: '#4CAF50'
                };
            } else {
                return { 
                    text: 'Your stress level shows moderate increase',
                    color: '#FF9800'
                };
            }
        } else { // significant_change
            if (trend === 'decreasing') {
                return { 
                    text: 'Your stress level shows significant improvement',
                    color: '#4CAF50'
                };
            } else {
                return { 
                    text: 'Your stress level shows significant increase',
                    color: '#F44336'
                };
            }
        }
    };

    const message = getInterpretationMessage();
    const { trend, difference, percentChange } = comparison;
    const trendColor = trend === 'decreasing' ? '#4CAF50' : trend === 'increasing' ? '#F44336' : '#757575';

    return (
        <section className="stressComparisonSection"
            style={{
                width: "100%",
                display: "flex",
                gap: "30px",
                backgroundColor: "transparent",
                padding: 0
            }}
        >
            {/* <h3 className="sectionTitle">Comparison with Previous {period === 'week' ? 'Week' : 'Month'}</h3> */}

            <div className="stressComparisonGrid" 
                style={{ 
                    display: 'flex', 
                    flexDirection: "row",
                    gap: '50px', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: "100%",
                    // backgroundColor: "#e8f5ff",
                    // padding: "20px",
                    borderRadius: "10px"
                }}
            >
                {/* Previous Stress */}
                <div className="stressCard" style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#757575' }}>Previous {period === 'week' ? 'Week' : 'Month'}</p>
                    <div style={{ 
                        backgroundColor: getStressColor(comparison.previous), 
                        padding: '20px', 
                        borderRadius: '10px',
                        minWidth: '120px'
                    }}>
                        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{comparison.previous}%</span>
                    </div>
                </div>

                {/* Arrow and Change */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    color: trendColor
                }}>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: "flex", justifyContent: "center", gap: "5px" }}>
                            {getArrowIcon(trend)}
                            {difference > 0 ? '+' : ''}{difference}%
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                            ({percentChange > 0 ? '+' : ''}{percentChange}% change)
                        </p>
                    </div>
                </div>

                {/* Current Stress */}
                <div className="stressCard" style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#757575' }}>Current {period === 'week' ? 'Week' : 'Month'}</p>
                    <div style={{ 
                        backgroundColor: getStressColor(comparison.current), 
                        padding: '20px', 
                        borderRadius: '10px',
                        minWidth: '120px'
                        // border: '3px solid ' + trendColor
                    }}>
                        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{comparison.current}%</span>
                    </div>
                </div>
            </div>
            <div className="interpretationMessage" style={{ 
                backgroundColor: message.color + '20', 
                borderLeft: `4px solid ${message.color}`, 
                padding: '15px', 
                borderRadius: '8px',
                width: "75%"
            }}>
                <p style={{ margin: 0, color: message.color, fontWeight: 'bold' }}>{message.text}</p>
            </div>
        </section>
    );
}

export default Statistic;