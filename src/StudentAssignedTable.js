import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { NavLink } from "react-router-dom";

import "./css/StudentInfo.css";
import {HeaderCounsellor, Footer} from "./HeaderFooter";
import {SubHeader} from "./PaInfo";
import MessageBox, {ConfirmationModal, TextareaModal} from "./Modal";
import { DashboardInfo } from "./StudentTableData";

function StudentAssignedTable() {

    useEffect(() => {
        document.title = "Student Assigned";
    }, []);

    const [studentTableData, setStudentTableData] = useState(null);
    const [dashboardData, setDashbaordData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [dassData, setDassData] = useState(null);

    const { paId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            // No token, redirect to login
            window.location.href = "/";
            return;
        }

        fetch(`http://localhost:8080/care_connect_system/backend/api/getStudentAssignedTable.php?paId=${paId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
            
            if(data.success){
                setStudentTableData(data);
                setDashbaordData(data.dashboardData);
                setDassData(data);
                // setProfileData(data.profileData);

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
            <StudentInformation paId={paId} studentData={studentTableData?.studentData} dashboardData={dashboardData} dassData={dassData?.studentDassData}/>
        </>
    );
}

function StudentSearch({paId, selected, activeTab, onSearchFilter, exportCSV}) {

    const buttonActivation = selected.length > 0 ? "active" : "inactive";
    const buttonActive = selected.length === 0;

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const [confirmationBox, setConfirmationBox] = useState({
        show: false,
        title: "",
        message: "",
        confirmText: "",
        cancelText: "",
        onConfirm: null,
        onCancel: null
    });

    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
        if (shouldRedirect) {
            window.location.href = `/StudentAssignedTable/${paId}`;
        }
    };
    
    const [activeSort, setActiveSort] = useState("filterOption");
    const [toggleSName, setToggleSName] = useState(false);
    const [toggleRLevel, setToggleRLevel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filterRef = useRef(null);
    const [showFilter, setShowFilter] = useState(false);

    const toggleFilterBox = () => {
        if(!showFilter){
            gsap.to(filterRef.current, {duration: 0.3, opacity: 1, height: 'auto', display: 'flex'});
        } else {
            gsap.to(filterRef.current, {duration: 0.3, opacity: 0, height: 0, display: 'none'});
        }
        setShowFilter(!showFilter);
    }

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        const token = localStorage.getItem("token");
        
        try {
            const response = await fetch(
                `http://localhost:8080/care_connect_system/backend/api/searchStudentAssigned.php?paId=${paId}&query=${encodeURIComponent(query)}&tab=${activeTab}`,
                {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                }
            );

            const data = await response.json();
            
            if (data.success) {
                onSearchFilter(data.studentData || data.dassData, 'search');
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    // ✅ Handle filter submit - FIXED
    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const token = localStorage.getItem("token");

        // Get filter values - these will be empty string if not selected
        const sortSName = formData.get('studentName') || '';
        const sortRLevel = formData.get('risk') || '';

        console.log("Filter Submit - sortSName:", sortSName, "sortRLevel:", sortRLevel); // Debug

        // ✅ FIXED: Check if at least one option is selected
        if (!sortSName && !sortRLevel) {
            setMessagebox({
                show: true,
                title: "Filter Apply Failed.",
                message: `Please select at least one filter option before applying.`,
                buttonValue: "OK",
                redirect: false
            });
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/care_connect_system/backend/api/filterStudentAssigned.php?paId=${paId}&sortSName=${sortSName}&sortRLevel=${sortRLevel}&tab=${activeTab}`,
                {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                }
            );

            const data = await response.json();
            console.log("Filter Response:", data); // Debug
            
            if (data.success) {
                
                onSearchFilter(data.studentData || data.dassData, 'filter');
                toggleFilterBox(); // Close filter after applying
                setMessagebox({
                    show: true,
                    title: "Filter Apply Successfully",
                    message: `Filter apply successfully.`,
                    buttonValue: "OK",
                    redirect: false
                });

            } else {
                console.error("Filter failed:", data);
            }
        } catch (error) {
            console.error("Filter error:", error);
        }
    };

    // ✅ Handle filter reset - FIXED
    const handleFilterReset = () => {
        // Reset form inputs
        const form = document.querySelector('.filterForm');
        if (form) {
            form.reset();
        }
        
        setActiveSort("filterOption");
        setToggleSName(false);
        setToggleRLevel(false);
        onSearchFilter(null, 'reset'); // Reset to original data
        
        toggleFilterBox(); // Close filter after applying
        setMessagebox({
            show: true,
            title: "Filter Reset Successfully",
            message: `Filter reset successfully.`,
            buttonValue: "OK",
            redirect: false
        });
    };

    return(
        <>
            <section className="searchbarWrapper">
                <form className="filterForm" onSubmit={handleFilterSubmit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16" onClick={toggleFilterBox}>
                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/>
                    </svg>
                    <section className="filterContentWrapper" ref={filterRef}>
                        <h3>Sort By</h3>
                        <div className="filterOptionWrapper">
                            <div
                                style={{
                                    borderRadius: toggleSName ? "10px 10px 0 0" : "10px"
                                }}
                                className={toggleSName ? "filterOption activeBtn" : "filterOption"} 
                                onClick={() => {
                                    setActiveSort("studentName");
                                    setToggleSName(!toggleSName);
                                }}   
                            >
                                Student Name
                                {toggleSName?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                    </svg>
                                :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                }
                            </div>
                            {toggleSName === true && (
                                <>
                                    <div 
                                        style={{
                                            borderRadius: toggleSName ? "0 0 10px 10px" : "10px"
                                        }}
                                        className="filterOptionContentWrapper"
                                    >
                                        <div className="filterGroup">
                                            <label>
                                                <input type="radio" name="studentName" value="az" />
                                                A → Z (ASC)
                                            </label>

                                            <label>
                                                <input type="radio" name="studentName" value="za" />
                                                Z → A (DESC)
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div
                                style={{
                                    marginTop: "25px",
                                    borderRadius: toggleRLevel ? "10px 10px 0 0" : "10px"
                                }}
                                className={toggleRLevel ? "filterOption activeBtn" : "filterOption"} 
                                onClick={() => {
                                    setActiveSort("riskLevel");
                                    setToggleRLevel(!toggleRLevel);
                                }}
                            >
                                Risk Level
                                {toggleRLevel ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                </svg>
                                }
                            </div>
                            {toggleRLevel === true && (
                                <>
                                    <div 
                                        style={{
                                            borderRadius: toggleSName ? "0 0 10px 10px" : "10px"
                                        }}
                                        className="filterOptionContentWrapper"
                                    >
                                        <div className="filterGroup">
                                            <label>
                                                <input type="radio" name="risk" value="low" />
                                                Low Risk
                                            </label>

                                            <label>
                                                <input type="radio" name="risk" value="medium" />
                                                Medium Risk
                                            </label>

                                            <label>
                                                <input type="radio" name="risk" value="high" />
                                                High Risk
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="buttonOption">
                            <input type="button" value="Reset" onClick={handleFilterReset} className="button" />
                            <input type="submit" value="Apply" />
                        </div>
                    </section>
                </form>
                <form className="searchForm" onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="text" 
                        placeholder="Type Student Name/ Matric Number"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </form>
                <div>
                    <button onClick={exportCSV}>
                        Export CSV
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filetype-csv" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
                        </svg>
                    </button>
                </div>
            </section>
            <MessageBox 
                show={messagebox.show}
                title={messagebox.title}
                message={messagebox.message}
                buttonValue={messagebox.buttonValue}
                onClose={handleModalButton}
            />
            <ConfirmationModal
                show={confirmationBox.show}
                title={confirmationBox.title}
                message={confirmationBox.message}
                confirmText={confirmationBox.confirmText}
                cancelText={confirmationBox.cancelText}
                onConfirm={confirmationBox.onConfirm}
                onCancel={confirmationBox.onCancel}
            />
        </>
    );
}

function StudentInformation({paId, studentData, dashboardData, dassData}) {

    const [activeTab, setActiveTab] = useState("studentList");
    const [selected, setSelected] = useState([]);
    
    // ✅ Store original and filtered data
    const [originalStudentData, setOriginalStudentData] = useState(studentData);
    const [originalDassData, setOriginalDassData] = useState(dassData);
    const [filteredStudentData, setFilteredStudentData] = useState(studentData);
    const [filteredDassData, setFilteredDassData] = useState(dassData);
    
    // ✅ Track if filter/search is active
    const [isFilterActive, setIsFilterActive] = useState(false);

    // ✅ Update when props change (only if no filter is active)
    useEffect(() => {
        setOriginalStudentData(studentData);
        if (!isFilterActive) {
            setFilteredStudentData(studentData);
        }
    }, [studentData]);

    useEffect(() => {
        setOriginalDassData(dassData);
        if (!isFilterActive) {
            setFilteredDassData(dassData);
        }
    }, [dassData]);

    // ✅ Handle search and filter results
    const handleSearchFilter = (data, type) => {
        console.log("handleSearchFilter called with type:", type); // Debug
        console.log("Data received:", data); // Debug
        console.log("Active tab:", activeTab); // Debug
        
        if (type === 'reset') {
            // Reset to original data
            console.log("Resetting to original data"); // Debug
            setFilteredStudentData(originalStudentData);
            setFilteredDassData(originalDassData);
            setIsFilterActive(false);
        } else {
            // Update with search/filter results
            console.log("Setting filter active and updating data"); // Debug
            setIsFilterActive(true);
            if (activeTab === "studentList") {
                console.log("Setting filtered student data:", data); // Debug
                setFilteredStudentData(data);
            } else {
                console.log("Setting filtered dass data:", data); // Debug
                setFilteredDassData(data);
            }
        }
    };

    // ✅ Reset filtered data when switching tabs
    useEffect(() => {
        setFilteredStudentData(originalStudentData);
        setFilteredDassData(originalDassData);
        setIsFilterActive(false);
    }, [activeTab]);

    const handleExportCSV = () => {
        if (activeTab === "studentList") {
            exportMoodSummaryCSV(filteredStudentData);
        } else {
            exportDassSummaryCSV(filteredDassData);
        }   
    };

    // Mood Report
    const exportMoodSummaryCSV = (studentData) => {
        if (!studentData || studentData.length === 0) return;

        // CSV Header Section with Title and Export Date
        const headerSection = [
            ["Student Emotion Report"],
            ["Export Date:", new Date().toLocaleString()],
            [""],
            [""]
        ];


        const headers = [
            "Matric No",
            "Student Name",
            "Risk Indicator",
            "Mood Pattern",
            "Stress Pattern",
            "Stress Trend",
            "Last Recorded Date",
            "Last Recorded Time",
            "Risk Indicator",
            "Today Contact Sent",
            "Today Note Recorded",
            'Num of Contact Sent (Total)',
            'Num of Note Recorded (Total)'
        ];

        const rows = studentData.map(student => {

            return [
                student.matricNo,
                student.studentName,
                student.riskIndicator,
                student.moodPattern,
                student.stressPattern,
                student.trend,
                student.lastRecordedDate,
                student.lastRecordedTime,
                student.riskIndicator,
                student.contactRecord ? "Yes" : "No",
                !student.contactRecord ? "No" : student.noteRecord ? "Yes" : "No",
                student.contactCount,
                student.noteCount
            ]
        });

        const csvContent = [
            // Header section with title and date
            ...headerSection.map(row => row.join(",")),
            headers.join(","),
            ...rows.map(row =>
                row.map(value => `"${value ?? ""}"`).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `Student_Mood_Summary.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    // Dass Report
    const getRiskIndicatorFromLevels = (levels) => {
        let normalCount = 0;
        let mildCount = 0;
        let moderateCount = 0;
        let severeCount = 0;
        let extremeSevereCount = 0;

        for (let i = 0; i < levels.length; i++) {
            if (levels[i] === "Normal") normalCount++;
            else if (levels[i] === "Mild") mildCount++;
            else if (levels[i] === "Moderate") moderateCount++;
            else if (levels[i] === "Severe") severeCount++;
            else if (levels[i] === "Extremely Severe") extremeSevereCount++;
        }

        if (extremeSevereCount > 0) {
            return "Critical";
        } else if (severeCount > 0) {
            return "High";
        } else if (moderateCount > 0) {
            return "Medium";
        } else {
            return "Low";
        }
    };

    const exportDassSummaryCSV = (dassData) => {
        if (!dassData || dassData.length === 0) return;

        // CSV Header Section with Title and Export Date
        const headerSection = [
            ["Student DASS Report"],
            ["Export Date:", new Date().toLocaleString()],
            [""],
            [""]
        ];

        const headers = [
            "Matric No",
            "Student Name",
            "Depression Level",
            "Anxiety Level",
            "Stress Level",
            "Status",
            "Completed Date",
            "Risk Indicator",
            "Today Contact Sent",
            "Today Note Recorded",
            'Num of Contact Sent (Total)',
            'Num of Note Recorded (Total)'
        ];

        const rows = dassData.map(dass => {
            
            const riskIndicator = getRiskIndicatorFromLevels([
                dass.depressionLevel,
                dass.anxietyLevel,
                dass.stressLevel
            ]);

            return [
                dass.matricNo,
                dass.studentName,
                dass.depressionLevel,
                dass.anxietyLevel,
                dass.stressLevel,
                dass.dassStatus,
                dass.completedDate,
                riskIndicator,
                dass.contactRecord ? "Yes" : "No",
                !dass.contactRecord ? "No" : dass.noteRecord ? "Yes" : "No",
                dass.contactCount,
                dass.noteCount

            ];
        });

        const csvContent = [
            // Header section with title and date
            ...headerSection.map(row => row.join(",")),
            // Table headers
            headers.join(","),
            ...rows.map(row =>
                row.map(value => `"${value ?? ""}"`).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "Student_Dass_Records.csv";
        link.click();

        URL.revokeObjectURL(url);
    };



    return (
        <>
            <main className="studentInfoContentMain">
                <SubHeader paId={paId} />
                <section className="studentInfoContentWrapper" 
                    style={{
                        width: "80%", 
                        gap: 0
                    }}
                >
                    <DashboardInfo dashboardData={dashboardData} studentData={studentData} />
                    <main className="StudentInfoMain" style={{
                        width: "100%", 
                    }}>
                        <nav className="tableNav">
                            <div>
                                <button 
                                    className={activeTab === "studentList" ? "activeBtn" : ""} 
                                    onClick={() => setActiveTab("studentList")}
                                >
                                    Emotion Trend
                                </button>
                            </div>
                            <div>
                                <button 
                                    className={activeTab === "dass" ? "activeBtn" : ""} 
                                    onClick={() => setActiveTab("dass")}
                                >
                                    DASS Screening
                                </button>
                            </div>
                        </nav>

                        <StudentSearch 
                            paId={paId}
                            selected={selected} 
                            activeTab={activeTab}
                            onSearchFilter={handleSearchFilter}
                            exportCSV={handleExportCSV}
                        />
                        
                        <section className="tableContent">
                            {activeTab === "studentList" && (
                                <StudentInfoTable 
                                    paId={paId}
                                    studentData={filteredStudentData || []} 
                                    selected={selected}
                                    setSelected={setSelected}
                                    exportCSV={exportMoodSummaryCSV}
                                />
                            )}
                            {activeTab === "dass" && (
                                <DassTable 
                                    paId={paId}
                                    dassData={filteredDassData || []} 
                                    exportCSV={exportDassSummaryCSV}
                                />
                            )}
                        </section>
                    </main>
                </section>
            </main>
        </>
    );
}

function DassTable({paId, dassData}) {

    const navigate = useNavigate();

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
    };

    // For action box part
    const actionRefs = useRef([]);
    const [openIndex, setOpenIndex] = useState(null);

    // Action box toggle
    const toggleAction = (index) => {
        const el = actionRefs.current[index];
        if (!el) return;

        if (openIndex === index) {
            gsap.to(el, {
                duration: 0.3,
                opacity: 0,
                height: 0,
                onComplete: () => {
                    el.style.display = "none";
                }
            });
            setOpenIndex(null);
        } else {
            if (openIndex !== null && actionRefs.current[openIndex]) {
                gsap.to(actionRefs.current[openIndex], {
                    duration: 0.2,
                    opacity: 0,
                    height: 0,
                    onComplete: () => {
                        actionRefs.current[openIndex].style.display = "none";
                    }
                });
            }

            el.style.display = "flex";
            gsap.fromTo(
                el,
                { opacity: 0, height: 0 },
                { duration: 0.3, opacity: 1, height: "auto" }
            );

            setOpenIndex(index);
        }
    };

    if (!dassData || dassData.length === 0) {
        return (
            <>
                <table className="dassNoRecordWrapper">
                    <thead>
                        <tr>
                            <th>Matric No</th>
                            <th>Student Name</th>
                            <th>Depression Level</th>
                            <th>Anxiety Level</th>
                            <th>Stress Level</th>
                            <th>Status</th>
                            <th>Completed Date</th>
                            <th>Risk Indicator</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={10}>No Record Yet</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    return(
        <>
            <table className="dassGotRecordWrapper">
                <thead>
                    <tr>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Depression Level</th>
                        <th>Anxiety Level</th>
                        <th>Stress Level</th>
                        <th>Status</th>
                        <th>Completed Date</th>
                        <th>Risk Indicator</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dassData.map((student, index) => {
                        let level = [], color = [];
                        level[0] = student.depressionLevel !== "No Record" ? student.depressionLevel : null;
                        level[1] = student.anxietyLevel !== "No Record" ? student.anxietyLevel : null;
                        level[2] = student.stressLevel !== "No Record" ? student.stressLevel : null;

                        let riskStatus = "Low Risk", riskColor = "#BFE5C8";
                        
                        let normalCount = 0, mildCount = 0, moderateCount = 0, severeCount = 0, extremeSevereCount = 0;
                        for (let i = 0; i < 3; i++) {
                            if (level[i] === "Normal") {
                                color[i] = "#BFE5C8";
                                normalCount++;
                            } else if (level[i] === "Mild") {
                                color[i] = "#e4e8ccff";
                                mildCount++;
                            } else if (level[i] === "Moderate") {
                                color[i] = "#e4b995ff";
                                riskStatus = "Moderate";
                                riskColor = "#ecb385ff";
                                moderateCount++;
                            } else if (level[i] === "Severe") {
                                color[i] = "#ff3a3a";
                                riskStatus = "High";
                                riskColor = "#ff3a3a";
                                severeCount++;
                            } else if (level[i] === "Extremely Severe") {
                                color[i] = "#ff3a3a";
                                riskStatus = "Critical";
                                riskColor = "#ff3a3a";
                                extremeSevereCount++;
                            }
                        }

                        if (extremeSevereCount > 0) {
                            riskStatus = "Critical";
                            riskColor = "#ff3a3a";
                        } else if (extremeSevereCount === 0 && severeCount > 0) {
                            riskStatus = "High";
                            riskColor = "#ff3a3a";
                        } else if (severeCount === 0 && moderateCount > 0) {
                            riskStatus = "Medium";
                            riskColor = "#ecb385ff";
                        } else if (moderateCount === 0) {
                            riskStatus = "Low";
                            riskColor = "#BFE5C8";
                        } else {
                            riskStatus = "Low";
                            riskColor = "#BFE5C8";
                        }

                        const goToStudentInfo = (id) => {
                            navigate(`/StudentInfoCounselling/${id}/${paId}`);
                        };

                        return (
                            <tr key={student.studentId}>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <td>{level[0] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[0] }}>
                                            {level[0]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{level[1] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[1] }}>
                                            {level[1]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td>{level[2] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: color[2] }}>
                                            {level[2]}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td style={{color: student.dassStatus === "Completed" ? "#32a74dff" : student.dassStatus === "Pending" ? "#e27f2eff" : "black"}}>{student.dassStatus}</td>
                                <td>{student.completedDate}</td>
                                <td>{level[0] !== null ? (
                                    <div>
                                        <label style={{ backgroundColor: riskColor }}>
                                            {riskStatus}
                                        </label>
                                    </div>
                                ) : "No Record"}</td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
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

function StudentInfoTable({paId, studentData, selected, setSelected}) {
    const allSelected = selected.length === (studentData ? studentData.length : 0);
    const navigate = useNavigate();
    

    const handleSelectAll = () => {
        if (allSelected) {
            setSelected([]);
        } else {
            setSelected(studentData.map(s => s.studentId));
        }
    };

    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const [messagebox, setMessagebox] = useState({
        show: false,
        title: "",
        message: "",
        buttonValue: "",
        redirect: true
    });

    const handleModalButton = () => {
        const shouldRedirect = messagebox.redirect;
        setMessagebox({ ...messagebox, show: false });
        if (shouldRedirect) {
            window.location.href = "/StudentTableData";
        }
    };

    // ✅ Combined modal state for both contact and note
    const [textareaModal, setTextareaModal] = useState({
        isOpen: false,
        purpose: "", // "contact" or "note"
        title: "",
        description: "",
        message: "",
        placeholder: "",
        maxLength: 0,
        confirmText: "",
        cancelText: "",
        noteType: "", // Only used for notes
        currentStudent: null
    });

    const closeTextareaModal = () => {
        setTextareaModal({
            isOpen: false,
            purpose: "",
            title: "",
            description: "",
            message: "",
            placeholder: "",
            maxLength: 0,
            confirmText: "",
            cancelText: "",
            noteType: "",
            currentStudent: null
        });
    };

    // ✅ Separate confirm handler that checks purpose
    const handleConfirmTextarea = async () => {
        const token = localStorage.getItem("token");
        const { currentStudent, message, purpose, noteType } = textareaModal;

        if (!currentStudent) return;

        // ✅ Validate message is not empty for BOTH purposes
        if (!message || !message.trim()) {
            // ❌ DON'T just show messagebox - it will overlap with textarea modal
            // Instead, close the textarea modal first
            const tempStudent = currentStudent;
            const tempPurpose = purpose;
            const tempNoteType = noteType;
            
            closeTextareaModal();
            
            setMessagebox({
                show: true,
                title: "Message Required",
                message: "Please enter a message before submitting.",
                buttonValue: "OK",
                redirect: false
            });
            
            // ✅ Reopen the modal after messagebox closes
            setTimeout(() => {
                if (tempPurpose === "contact") {
                    handleContactBox(tempStudent);
                } else {
                    handleNoteBox(tempStudent);
                    // Restore the noteType that was selected
                    setTextareaModal(prev => ({
                        ...prev,
                        noteType: tempNoteType
                    }));
                }
            }, 100);
            
            return;
        }

        try {
            let response;
            
            if (purpose === "contact") {
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/contactStudent.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            message: message
                        })
                    }
                );
            } else if (purpose === "note") {
                // Validate note type is selected
                if (!noteType) {
                    const tempStudent = currentStudent;
                    const tempMessage = message;
                    
                    closeTextareaModal();
                    
                    setMessagebox({
                        show: true,
                        title: "Note Type Required",
                        message: "Please select a note type before submitting.",
                        buttonValue: "OK",
                        redirect: false
                    });
                    
                    // ✅ Reopen with the message preserved
                    setTimeout(() => {
                        handleNoteBox(tempStudent);
                        setTextareaModal(prev => ({
                            ...prev,
                            message: tempMessage
                        }));
                    }, 100);
                    
                    return;
                }
                
                response = await fetch(
                    "http://localhost:8080/care_connect_system/backend/api/noteRecord.php",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            studentId: currentStudent.studentId,
                            noteType: noteType,
                            message: message
                        })
                    }
                );
            }

            const result = await response.json();

            closeTextareaModal();

            setMessagebox({
                show: true,
                title: result.success 
                    ? (purpose === "contact" ? "Student Contacted Successfully" : "Note Added Successfully")
                    : (purpose === "contact" ? "Contact Failed" : "Note Failed"),
                message: result.success
                    ? (purpose === "contact" 
                        ? `A meeting notification has been sent to ${currentStudent.studentName}.`
                        : `Note has been added for ${currentStudent.studentName}.`)
                    : (result.message || `Failed to ${purpose === "contact" ? "send notification" : "add note"}.`),
                buttonValue: "OK",
                redirect: result.success
            });

        } catch (error) {
            console.error(error);
            closeTextareaModal();
            setMessagebox({
                show: true,
                title: purpose === "contact" ? "Contact Failed" : "Note Failed",
                message: "An error occurred while processing your request.",
                buttonValue: "OK",
                redirect: false
            });
        }
    };

    // ✅ Open contact modal
    const handleContactBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "contact",
            title: "Contact Student",
            description: "Please review or customize the message before sending to the student.",
            message: "We would like to schedule a meeting to discuss your wellbeing and provide support. Please let us know your availability.",
            placeholder: "Write your message here...",
            maxLength: 500,
            confirmText: "Send",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

    // ✅ Open note modal
    const handleNoteBox = (student) => {
        setTextareaModal({
            isOpen: true,
            purpose: "note",
            title: "Student Case Note",
            description: "This note is for internal reference only and will not be visible to the student.",
            message: "",
            placeholder: "Enter meeting summary, observations, or follow-up actions...",
            maxLength: 100000,
            confirmText: "Save Note",
            cancelText: "Cancel",
            noteType: "",
            currentStudent: student
        });
    };

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

    const openDassModal = async (student) => {
        setConfirmationBox({
            show: true,
            title: "Send Dass to Student?",
            message: "This action cannot be undone.",
            confirmText: "Send",
            cancelText: "Cancel",
            onConfirm: async () => {
                setConfirmationBox(prev => ({ ...prev, show: false }));

                const token = localStorage.getItem("token");

                try {
                    const response = await fetch(`http://localhost:8080/care_connect_system/backend/api/sendDass.php?studentId=${student.studentId}`, {
                            method: "GET",
                            headers: { "Authorization": "Bearer " + token }
                        }
                    );

                    const result = await response.json();
                        setMessagebox({
                            show: true,
                            title: result.success ? "DASS Assessment Sent Successfully" : "DASS Assessment Failed To Send",
                            message: result.success
                                ? `DASS Assessment has been sent successfully to ${student.studentName}.`
                                : `Failed to send DASS Assessment to ${student.studentName}.`,
                            buttonValue: "OK"
                        });

                        navigate("/StudentTableData");
                } catch (error) {
                    console.error(error);
                    setMessagebox({
                        show: true,
                        title: "DASS Assessment Failed To Send",
                        message: `Failed to send DASS Assessment to ${student.studentName} due to error`,
                        buttonValue: "OK"
                    });
                }
            },
            onCancel: () =>
                setConfirmationBox(prev => ({ ...prev, show: false }))
        });
    };

    const actionRefs = useRef([]);
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAction = (index) => {
        const el = actionRefs.current[index];
        if (!el) return;

        if (openIndex === index) {
            gsap.to(el, {
                duration: 0.3,
                opacity: 0,
                height: 0,
                onComplete: () => {
                    el.style.display = "none";
                }
            });
            setOpenIndex(null);
        } else {
            if (openIndex !== null && actionRefs.current[openIndex]) {
                gsap.to(actionRefs.current[openIndex], {
                    duration: 0.2,
                    opacity: 0,
                    height: 0,
                    onComplete: () => {
                        actionRefs.current[openIndex].style.display = "none";
                    }
                });
            }

            el.style.display = "flex";
            gsap.fromTo(
                el,
                { opacity: 0, height: 0 },
                { duration: 0.3, opacity: 1, height: "auto" }
            );

            setOpenIndex(index);
        }
    };

    if (!studentData || studentData.length === 0) {
        return (
            <table className="noRecordWrapper">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Period</th>
                        <th>Mood Changes</th>
                        <th>Mood Summary</th>
                        <th>Stress Changes</th>
                        <th>Stress Summary</th>
                        <th>Risk</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan={10}>No Record Yet</td></tr>
                </tbody>
            </table>
        );
    }

    return (
        <>
            <table className="gotRecordWrapper">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                        <th>Matric No</th>
                        <th>Student Name</th>
                        <th>Period</th>
                        <th>Mood Changes</th>
                        <th>Mood Summary</th>
                        <th>Stress Changes</th>
                        <th>Stress Summary</th>
                        <th>Risk</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {studentData.map((student, index) => {
                        const goToStudentInfo = (id) => navigate(`/StudentInfoCounselling/${id}/${paId}`);
                        const riskColor =
                            student.riskIndicator === "High" ? "#ff3a3a" :
                            student.riskIndicator === "Need Attention" ? "#ecb385" : "#BFE5C8";

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
                            // Check if monthlyComparison and mood exist
                            if (!student.monthlyComparison?.mood) {
                                return { text: 'No data', color: '#757575' };
                            }
                            
                            const { overallTrend } = student.monthlyComparison.mood;
                            
                            if (overallTrend === 'improving') {
                                return { text: 'Positive improvement', color: '#4CAF50' };
                            } else if (overallTrend === 'declining') {
                                return { text: 'Mood balance changed', color: '#ff1111' };
                            }
                            return { text: 'Remains stable', color: '#2196F3' };
                        };

                        const getStressColor = (value) => {
                            if (value <= 20) return "#BFE5C8";
                            if (value <= 40) return "#d9f2dfff";
                            if (value <= 60) return "#e4b995ff";
                            if (value <= 80) return "#e9b6b6ff";
                            return "#ee7878ff";
                        };

                        const getStressArrowIcon = (trend) => {
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
                            // Check if monthlyComparison and stress exist
                            if (!student.monthlyComparison?.stress) {
                                return { 
                                    text: 'No stress data available',
                                    color: '#757575'
                                };
                            }
                            
                            const interpretation = student.monthlyComparison?.stress?.overallTrend;
                            
                            if (interpretation === 'improving') {
                                return {
                                    text: 'Moderate improvement',
                                    color: '#4CAF50'
                                };
                            } else if (interpretation === 'worsening') { 
                                return { 
                                    text: 'Significant increase',
                                    color: '#F44336'
                                };
                            } else {
                                return {
                                    text: 'Stable',
                                    color: '#4CAF50'
                                };
                            }
                            // if (interpretation === 'minimal_change') {
                            //     return { 
                            //         text: 'Relatively stable',
                            //         color: '#2196F3'
                            //     };
                            // } else if (interpretation === 'moderate_change') {
                            //     if (trend === 'decreasing') {
                            //         return { 
                            //             text: 'Moderate improvement',
                            //             color: '#4CAF50'
                            //         };
                            //     } else {
                            //         return { 
                            //             text: 'Moderate increase',
                            //             color: '#FF9800'
                            //         };
                            //     }
                            // } 
                            // else { // significant_change
                            //     if (trend === 'decreasing') {
                            //         return { 
                            //             text: 'Significant improvement',
                            //             color: '#4CAF50'
                            //         };
                            //     } else {
                            //         return { 
                            //             text: 'Significant increase',
                            //             color: '#F44336'
                            //         };
                            //     }
                            // }
                        };

                        const getRiskIndicator = () => {
                            // Default values if data doesn't exist
                            const trendMood = student.monthlyComparison?.mood?.negative?.trend;
                            const trendStress = student.monthlyComparison?.stress?.high?.trend;

                            // If no data, return low risk
                            if (!trendMood && !trendStress) {
                                return {
                                    text: "No Data",
                                    color: "#757575"
                                };
                            }

                            if (trendMood === "increasing" && trendStress === "increasing") {
                                return {
                                    text: "High",
                                    color: "#F44336"
                                };
                            } else if (trendMood === "increasing" || trendStress === "increasing") {
                                return {
                                    text: "Moderate",
                                    color: "#f49e36ff"
                                };
                            } else {
                                return {
                                    text: "Low",
                                    color: "#4CAF50"
                                };
                            }
                        };

                        // ✅ CALCULATE ALL VARIABLES HERE with null-safe access
                        const overallMessage = getOverallMessage();
                        const message = getInterpretationMessage();
                        
                        // ✅ Safe access with default values
                        const trend = student.monthlyComparison?.stress?.trend || 'stable';
                        const difference = student.monthlyComparison?.stress?.difference ?? 0;
                        const percentChange = student.monthlyComparison?.stress?.percentChange ?? 0;
                        const trendColor = trend === 'decreasing' ? '#4CAF50' : trend === 'increasing' ? '#F44336' : '#757575';

                        const trendLow = student.monthlyComparison?.stress?.low?.trend || 'stable';
                        const trendColorLow = trendLow === 'increasing' ? '#4CAF50' : trendLow === 'decreasing' ? '#F44336' : '#757575';
                        const trendHigh = student.monthlyComparison?.stress?.high?.trend || 'stable';
                        const trendColorHigh = trendHigh === 'decreasing' ? '#4CAF50' : trendHigh === 'increasing' ? '#F44336' : '#757575';

                        // For mood changes
                        if (!student.monthlyComparison?.mood && !student.monthlyComparison?.stress) {
                            return (
                                <tr>
                                    <td><input type="checkbox" checked={selected.includes(student.studentId)} onChange={() => handleSelectOne(student.studentId)} /></td>
                                    <td>{student.matricNo}</td>
                                    <td>{student.studentName}</td>
                                    <td colSpan={6}>
                                        No monthly comparison data available
                                    </td>
                                    <td className="actionTd">
                                        <button onClick={() => toggleAction(index)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                            </svg>
                                        </button>
                                        <div ref={el => (actionRefs.current[index] = el)}>
                                            <h3>Action Select</h3>
                                            <button onClick={() => goToStudentInfo(student.studentId)}>
                                                View Info
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td> 
                                </tr>
                            );
                        } else if (!student.monthlyComparison?.mood && student.monthlyComparison?.stress) {
                            <tr>
                                <td><input type="checkbox" checked={selected.includes(student.studentId)} onChange={() => handleSelectOne(student.studentId)} /></td>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <label style={{ fontSize: "2.2vh" }}>
                                        {student.period} - 
                                    </label>
                                <td colSpan={2}>
                                    No monthly comparison data available
                                </td>
                                
                                <td style={{ backgroundColor: "#c5c4e9ff" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        {/* Low */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#BFE5C8",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + trendColorLow,
                                            color: trendColorLow
                                        }}>
                                            Low: {getStressArrowIcon(student.monthlyComparison?.stress?.low?.trend)}
                                            {Math.abs(student.monthlyComparison?.stress?.low?.difference ?? 0)}%
                                        </div>

                                        {/* High */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#fac7c7ff",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + trendColorHigh,
                                            color: trendColorHigh
                                        }}>
                                            High: {getStressArrowIcon(student.monthlyComparison?.stress?.high?.trend)}
                                            {Math.abs(student.monthlyComparison?.stress?.high?.difference ?? 0)}%
                                        </div>
                                    </div>
                                </td>
                                <td style={{ backgroundColor: "#c5c4e9ff" }}>
                                    <p style={{ margin: 0, color: message.color, fontWeight: 'bold', fontSize: "2.2vh" }}>
                                        {message.text}
                                    </p>
                                </td>
                                <td>
                                    <label style={{
                                        fontSize: "2.2vh",
                                        padding: "5px",
                                        backgroundColor: getRiskIndicator().color
                                    }}>
                                        {getRiskIndicator().text}
                                    </label>
                                </td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td> 
                            </tr>
                        } else if (student.monthlyComparison?.mood && !student.monthlyComparison?.stress) {
                            <tr>
                                <td><input type="checkbox" checked={selected.includes(student.studentId)} onChange={() => handleSelectOne(student.studentId)} /></td>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>
                                <td>
                                    <label style={{ fontSize: "2.2vh" }}>
                                        {student.period} - 
                                    </label>
                                </td>
                                <td style={{ backgroundColor: "#dbdaf3ff" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        {/* Positive */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px 10px",
                                            backgroundColor: "#BFE5C8",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + getTrendColor(
                                                'positive',
                                                student.monthlyComparison?.mood?.positive?.trend
                                            ),
                                            color: getTrendColor(
                                                'positive',
                                                student.monthlyComparison?.mood?.positive?.trend
                                            )
                                        }}>
                                            Pos (+): {getArrowIcon(student.monthlyComparison?.mood?.positive?.trend)}
                                            +{Math.abs(student.monthlyComparison?.mood?.positive?.difference ?? 0)}%
                                        </div>

                                        {/* Negative */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            backgroundColor: "#fac7c7ff",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + getTrendColor(
                                                'negative',
                                                student.monthlyComparison?.mood?.negative?.trend
                                            ),
                                            color: getTrendColor(
                                                'negative',
                                                student.monthlyComparison?.mood?.negative?.trend
                                            )
                                        }}>
                                            Neg (-): {getArrowIcon(student.monthlyComparison?.mood?.negative?.trend)}
                                            -{Math.abs(student.monthlyComparison?.mood?.negative?.difference ?? 0)}%
                                        </div>
                                    </div>
                                </td>
                                <td><p style={{ margin: 0, color: overallMessage.color, fontWeight: 'bold', fontSize: "2.2vh" }}>{overallMessage.text}</p></td>
                                <td colSpan={2}>
                                    No monthly comparison data available
                                </td>
                                <td>
                                    <label style={{
                                        fontSize: "2.2vh",
                                        padding: "5px",
                                        backgroundColor: getRiskIndicator().color
                                    }}>
                                        {getRiskIndicator().text}
                                    </label>
                                </td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td> 
                            </tr>
                        }

                    // ✅ Final return: Student has BOTH mood AND stress data
                        return (
                            <tr key={student.studentId}>
                                <td><input type="checkbox" checked={selected.includes(student.studentId)} onChange={() => handleSelectOne(student.studentId)} /></td>
                                <td>{student.matricNo}</td>
                                <td>{student.studentName}</td>

                                <td>
                                    <label style={{ fontSize: "2.2vh" }}>
                                        {student.period}
                                    </label>
                                </td>

                                <td style={{ backgroundColor: "#dbdaf3ff" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        {/* Positive */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#BFE5C8",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + getTrendColor(
                                                'positive',
                                                student.monthlyComparison?.mood?.positive?.trend
                                            ),
                                            color: getTrendColor(
                                                'positive',
                                                student.monthlyComparison?.mood?.positive?.trend
                                            )
                                        }}>
                                            Pos (+): {getArrowIcon(student.monthlyComparison?.mood?.positive?.trend)}
                                            {Math.abs(student.monthlyComparison?.mood?.positive?.difference ?? 0)}%
                                        </div>

                                        {/* Negative */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#fac7c7ff",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + getTrendColor(
                                                'negative',
                                                student.monthlyComparison?.mood?.negative?.trend
                                            ),
                                            color: getTrendColor(
                                                'negative',
                                                student.monthlyComparison?.mood?.negative?.trend
                                            )
                                        }}>
                                            Neg (-): {getArrowIcon(student.monthlyComparison?.mood?.negative?.trend)}
                                            {Math.abs(student.monthlyComparison?.mood?.negative?.difference ?? 0)}%
                                        </div>
                                    </div>
                                </td>


                                <td style={{ backgroundColor: "#dbdaf3ff" }}>
                                    <p style={{ margin: 0, color: overallMessage.color, fontWeight: 'bold', fontSize: "2.2vh" }}>
                                        {overallMessage.text}
                                    </p>
                                </td>
                                
                                <td style={{ backgroundColor: "#c5c4e9ff" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        {/* Low */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#BFE5C8",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + trendColorLow,
                                            color: trendColorLow
                                        }}>
                                            Low: {getStressArrowIcon(student.monthlyComparison?.stress?.low?.trend)}
                                            {Math.abs(student.monthlyComparison?.stress?.low?.difference ?? 0)}%
                                        </div>

                                        {/* High */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            textWrap: "nowrap",
                                            gap: "5px 10px",
                                            backgroundColor: "#fac7c7ff",
                                            borderRadius: "10px",
                                            padding: "5px",
                                            border: "1px solid" + trendColorHigh,
                                            color: trendColorHigh
                                        }}>
                                            High: {getStressArrowIcon(student.monthlyComparison?.stress?.high?.trend)}
                                            {Math.abs(student.monthlyComparison?.stress?.high?.difference ?? 0)}%
                                        </div>
                                    </div>
                                </td>


                                <td style={{ backgroundColor: "#c5c4e9ff" }}>
                                    <p style={{ margin: 0, color: message.color, fontWeight: 'bold', fontSize: "2.2vh" }}>
                                        {message.text}
                                    </p>
                                </td>

                                <td>
                                    <label style={{
                                        fontSize: "2.2vh",
                                        padding: "5px",
                                        backgroundColor: getRiskIndicator().color
                                    }}>
                                        {getRiskIndicator().text}
                                    </label>
                                </td>

                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(student.studentId)}>
                                            View Info
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
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
            {/* ✅ Single TextareaModal that adapts based on purpose */}
            <TextareaModal
                show={textareaModal.isOpen}
                purpose={textareaModal.purpose}
                title={textareaModal.title}
                description={textareaModal.description}
                placeholder={textareaModal.placeholder}
                value={textareaModal.message}
                onChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        message: value
                    }))
                }
                noteType={textareaModal.noteType}
                onNoteTypeChange={(value) =>
                    setTextareaModal(prev => ({
                        ...prev,
                        noteType: value
                    }))
                }
                maxLength={textareaModal.maxLength}
                confirmText={textareaModal.confirmText}
                cancelText={textareaModal.cancelText}
                onConfirm={handleConfirmTextarea}
                onCancel={closeTextareaModal}
            />
        </>
    );
}


export default StudentAssignedTable;