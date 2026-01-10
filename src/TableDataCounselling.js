import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import "./css/StudentTableData.css";
import {HeaderCounsellor, Footer} from "./HeaderFooter";
import MessageBox, {ConfirmationModal, TextareaModal} from "./Modal";

function TableDataCounselling() {

    useEffect(() => {
        document.title = "Statistic";
    }, []);

    const [allPADetails, setAllPADetails] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

     useEffect(() => {
         const token = localStorage.getItem("token");
 
         if(!token){
             // No token, redirect to login
             window.location.href = "/";
             return;
         }
 
         fetch("http://localhost:8080/care_connect_system/backend/api/getPADetails.php", {
             method: "GET",
             headers: {
                 "Authorization": "Bearer " + token
             }
         })
         .then(res => res.json())
         .then(data => {
             console.log("PROFILE RESPONSE:", data);   // ← VERY IMPORTANT
             
             if(data.success){
                 setAllPADetails(data.allPADetails);
                 setDashboardData(data.dashboardData);
 
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
            <DashboardInfo  dashboardData={dashboardData} />
            <PAInformation allPADetails={allPADetails}/>
            <Footer />
        </>
    );
}

function DashboardInfo({dashboardData}) {

    return(
        <>
            <main className="dashbaordPAMain">
                <section className="dashboardPAWrapper">
                    <div className="dashbaordItemWrapper">
                        <div className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                            </svg>
                        </div>
                        <div className="content">
                            <label>Total Penasihat Akademik</label>
                            <h2>{dashboardData?.paCount}</h2>
                        </div>
                    </div>
                    <div className="dashbaordItemWrapper">
                        <div className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
                                <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
                            </svg>
                        </div>
                        <div className="content">
                            <label>All Students at High Emotional Risk</label>
                            <h2>{dashboardData?.totalHighMoodRiskCount} / {dashboardData?.studentCount}</h2>
                        </div>
                    </div>
                    <div className="dashbaordItemWrapper">
                        <div className="icon" >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
                                <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
                            </svg>
                        </div>
                        <div className="content">
                            <label>All Students at High DASS Risk</label>
                            <h2>{dashboardData?.totalHighDassRiskCount} / {dashboardData?.studentCount}</h2>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function PASearch({onSearchFilter, exportCSV}) {

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
            window.location.href = "/StatisticCounsellor";
        }
    };
    

    const [activeSort, setActiveSort] = useState("filterOption");
    const [toggleSName, setToggleSName] = useState(false);
    const [toggleFaculty, setToggleFaculty] = useState(false);
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
                `http://localhost:8080/care_connect_system/backend/api/searchbarCounselling.php?query=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                }
            );

            const data = await response.json();
            
            if (data.success) {
                onSearchFilter(data.allPADetails, 'search');
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
        const sortFaculty = formData.get('faculty') || '';

        console.log("Filter Submit - sortSName:", sortSName, "sortRLevel:", sortRLevel, "sortFaculty:", sortFaculty); // Debug

        // ✅ FIXED: Check if at least one option is selected (including faculty)
        if (!sortSName && !sortRLevel && !sortFaculty) {
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
            // ✅ FIXED: Include sortFaculty in the API call
            const response = await fetch(
                `http://localhost:8080/care_connect_system/backend/api/filterCounselling.php?sortSName=${sortSName}&sortRLevel=${sortRLevel}&sortFaculty=${sortFaculty}`,
                {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                }
            );

            const data = await response.json();
            console.log("Filter Response:", data); // Debug
            
            if (data.success) {
                onSearchFilter(data.allPADetails, 'filter');
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
                                PA Name
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
                                    borderRadius: toggleFaculty ? "10px 10px 0 0" : "10px"
                                }}
                                className={toggleFaculty ? "filterOption activeBtn" : "filterOption"} 
                                onClick={() => {
                                    setActiveSort("studentName");
                                    setToggleFaculty(!toggleFaculty);
                                }}   
                            >
                                Faculty
                                {toggleFaculty?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                    </svg>
                                :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                }
                            </div>
                            {toggleFaculty === true && (
                                <>
                                    <div 
                                        style={{
                                            borderRadius: toggleFaculty ? "0 0 10px 10px" : "10px"
                                        }}
                                        className="filterOptionContentWrapper"
                                    >
                                        <div className="filterGroup" style={{
                                            flexWrap: "wrap"
                                        }}>
                                            <label>
                                                <input type="radio" name="faculty" value="FTKEK" />
                                                FTKEK
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FTKE" />
                                                FTKE
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FTKM" />
                                                FTKM
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FTKIP" />
                                                FTKIP
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FTMK" />
                                                FTMK
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FPTT" />
                                                FPTT
                                            </label>

                                            <label>
                                                <input type="radio" name="faculty" value="FAIX" />
                                                FAIX
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
                                Highest (DESC)
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
                                                High-Risk (Mood & Stress)
                                            </label>

                                            <label>
                                                <input type="radio" name="risk" value="medium" />
                                                High Risk (DASS)
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
                        placeholder="Type PA Name/ PA Number"
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

function PAInformation({allPADetails}) {

    // ✅ Store original and filtered data
    const [originalPAData, setOriginalPAData] = useState(allPADetails);
    const [filteredPAData, setFilteredPAData] = useState(allPADetails);
    
    // ✅ Track if filter/search is active
    const [isFilterActive, setIsFilterActive] = useState(false);

    // ✅ Update when props change (only if no filter is active)
    useEffect(() => {
        setOriginalPAData(allPADetails);
        if (!isFilterActive) {
            setFilteredPAData(allPADetails);
        }
    }, [allPADetails]);

    // ✅ Handle search and filter results
    const handleSearchFilter = (data, type) => {
        console.log("handleSearchFilter called with type:", type); // Debug
        console.log("Data received:", data); // Debug
        
        if (type === 'reset') {
            // Reset to original data
            console.log("Resetting to original data"); // Debug
            setFilteredPAData(originalPAData);
            setIsFilterActive(false);
        } else {
            // Update with search/filter results
            console.log("Setting filter active and updating data"); // Debug
            setIsFilterActive(true);
            console.log("Setting filtered student data:", data); // Debug
            setFilteredPAData(data);

        }
    };

    const handleExportCSV = () => {
        exportMoodSummaryCSV(filteredPAData);

    };

    // Mood Report
    // Mood Report with Title and Export Date
const exportMoodSummaryCSV = (allPADetails) => {
    if (!allPADetails || allPADetails.length === 0) return;

    // CSV Header Section with Title and Export Date
    const headerSection = [
        ["PA x Student Mood & DASS Summary Report"],
        ["Export Date:", new Date().toLocaleString()],
        [""],
        [""]
    ];

    // Data Table Headers
    const headers = [
        "Staff No",
        "Staff Name",
        "Student Assigned",
        "Period",
        "High-Risk Students (Mood & Stress)",
        "Student Contacted",
        "Case Notes Recorded",
        "High-Risk Students (DASS)"
    ];

    // Data Rows
    const rows = allPADetails.map(PADetails => {
        return [
            PADetails.PAData.staffNo,
            PADetails.PAData.staffName,
            PADetails.studentAssigned,
            PADetails.period,
            PADetails.highRiskMoodLast7Days,
            PADetails.contactedStudentLast7Days,
            PADetails.noteRecordedLast7Days,
            PADetails.highRiskDassLast7Days,
        ]
    });

    // Combine everything
    const csvContent = [
            // Header section with title and date
            ...headerSection.map(row => row.join(",")),
            // Table headers
            headers.join(","),
            // Data rows
            ...rows.map(row =>
                row.map(value => `"${value ?? ""}"`).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `PA_Student_Mood_DASS_Summary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <main className="StudentInfoMain">
                <nav className="tableNav">
                    <div>
                        <button 
                            className="activeBtn"
                            style={{
                                borderRadius: "15px 15px 0 0",
                                width: "400px"
                            }}
                        >
                            PA x Student Mood & Dass Summary
                        </button>
                    </div>
                </nav>

                <PASearch 
                    onSearchFilter={handleSearchFilter}
                    exportCSV={handleExportCSV}
                />
                
                <section className="tableContent">
                    <PADetailsTable allPADetails={filteredPAData || []}/>
                </section>
            </main>
        </>
    );
}


function PADetailsTable({allPADetails}) {

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
        if (shouldRedirect) {
            window.location.href = "/StatisticCounsellor.js";
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

    if (!allPADetails || allPADetails.length === 0) {
        return (
            <table className="noRecordWrapper">
                <thead>
                    <tr>
                        <th>PA No</th>
                        <th>PA Name</th>
                        <th>PA Faculty</th>
                        <th>Students Assigned</th>
                        <th>Period</th>
                        <th>High-Risk Students (Mood & Stress)</th>
                        <th>Student Contacted</th>
                        <th>Case Notes Recorded</th>
                        <th>High-Risk Students (DASS)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan={10}>No Record Yet</td></tr>
                </tbody>
            </table>
        );
    }

    return(
        <>
            <table className="gotRecordWrapper">
                <thead>
                    <tr>
                        <th>PA No</th>
                        <th>PA Name</th>
                        <th>PA Faculty</th>
                        <th>Students Assigned</th>
                        <th>Period</th>
                        <th>High-Risk Students (Mood & Stress)</th>
                        <th>Student Contacted</th>
                        <th>Case Notes Recorded</th>
                        <th>High-Risk Students (DASS)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {allPADetails.map((PADetails, index) => {
                        const goToStudentInfo = (id) => navigate(`/PaInfo/${id}`);
                        const riskColor =
                            allPADetails.riskIndicator === "High" ? "#ff3a3a" :
                            allPADetails.riskIndicator === "Need Attention" ? "#ecb385" : "#BFE5C8";

                        return (
                            <tr key={PADetails.PAData.staffId}>
                                <td>{PADetails.PAData.staffNo}</td>
                                <td style={{width: "200px"}}>{PADetails.PAData.staffName}</td>
                                <td>{PADetails.PAData.staffFaculty}</td>
                                <td>{PADetails.studentAssigned}</td>
                                <td style={{
                                    backgroundColor: "#c7e0eaff"
                                }}>{PADetails.period}</td>
                                <td style={{
                                    backgroundColor: "#c7e0eaff"
                                }}>{PADetails.highRiskMood}</td>
                                <td style={{
                                    backgroundColor: "#c7e0eaff"
                                }}>{PADetails.contactedStudent}</td>
                                <td style={{
                                    backgroundColor: "#c7e0eaff"
                                }}>{PADetails.noteRecorded}</td>
                                <td style={{
                                    backgroundColor: "#cbc8f3ff"
                                }}>{PADetails.highRiskDass}</td>
                                <td className="actionTd">
                                    <button onClick={() => toggleAction(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                        </svg>
                                    </button>
                                    <div ref={el => (actionRefs.current[index] = el)}>
                                        <h3>Action Select</h3>
                                        <button onClick={() => goToStudentInfo(PADetails.PAData.staffId)}>
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



export default TableDataCounselling;