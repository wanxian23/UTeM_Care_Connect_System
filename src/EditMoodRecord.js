import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import {Header, Footer} from "./HeaderFooter";
import { NavLink } from "react-router-dom";

import "./css/MoodRecord.css";
import MessageBox from "./Modal";

function EditMoodRecord() {

    useEffect(() => {
        document.title = "Edit Mood Record";
    }, []);

    
    return(
        <>
            <Header />
            <RecordMoodNote />
            <Footer />
        </>
    );
}

function MoodChoose({moodData}) {

    const [selectedText, setSelectedText] = useState("Click On Either of The Emoji To Express Your Current Feelings!");
    const textRef = useRef(); // Create the reference
    const labelRefs = useRef([]);

    const [selected, setSelected] = useState(null);

    const items = [
        { 
            id: 1, 
            label: "Excited", 
            message: "You seem really excited today! Something awesome must’ve happened!", 
            img: "/EmotionCuteEmoji/4.png"
        },
        { 
            id: 2, 
            label: "Happy", 
            message: "You look really happy today! Keep spreading those positive vibes!", 
            img: "/EmotionCuteEmoji/1.png"
        },
        { 
            id: 3, 
            label: "Neutral", 
            message: "Feeling neutral today? That's completely okay — not every day has to be emotional.", 
            img: "/EmotionCuteEmoji/10.png"
        },
        { 
            id: 4, 
            label: "Sad", 
            message: "Feeling a bit sad today? It’s okay — tough moments don’t last, and you’re not alone.", 
            img: "/EmotionCuteEmoji/11.png"
        },
        { 
            id: 5, 
            label: "Crying", 
            message: "Aww… feeling overwhelmed? It’s okay to cry — you’re doing your best, and that’s enough.", 
            img: "/EmotionCuteEmoji/7.png"
        },
        { 
            id: 6, 
            label: "Angry", 
            message: "You seem a bit angry… it’s alright. Take a deep breath — you’ve got this.", 
            img: "/EmotionCuteEmoji/6.png"
        },
        { 
            id: 7, 
            label: "Anxious", 
            message: "Feeling anxious today? It’s okay — take things one step at a time. You’re stronger than you think.", 
            img: "/EmotionCuteEmoji/12.png"
        },
        { 
            id: 8, 
            label: "Annoying", 
            message: "Something’s annoying you, huh? It’s okay — sometimes small things can really get to us.", 
            img: "/EmotionCuteEmoji/13.png"
        }
    ];


    // Set initial selected mood from moodData when it loads
    useEffect(() => {
        console.log("MoodData received:", moodData);
        console.log("MoodData.moodTypeId:", moodData?.moodTypeId);
        console.log("Type of moodTypeId:", typeof moodData?.moodTypeId);
        
        if (moodData && moodData.moodTypeId) {
            console.log("Setting selected to:", moodData.moodTypeId);
            setSelected(moodData.moodTypeId);
            
            const emoji = items.find(item => item.id === moodData.moodTypeId);
            console.log("Found emoji:", emoji);
            if (emoji) {
                setSelectedText(emoji.message);
            }
        }
    }, [moodData?.moodTypeId]); // ✅ Changed dependency to be more specific

    // Animate when text changes
    useEffect(() => {
        labelRefs.current.forEach((label) => {
            if (label) {
                gsap.to(label, { opacity: 0, y: -10, duration: 0.2 });
            }
        });

        if (selected) {
            const el = labelRefs.current[selected];
            if (el) {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 5 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "back.out(8)" }
                );
            }

            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 5 },
                { opacity: 1, y: 0, duration: 0.6, ease: "back.out(8)" }
            );
        }
    }, [selected]);

    return(
        <>
            <main id='MainFirst'>
                <h1>Wanna update your mood ?</h1>
                <article id='emojiWrapper'>
                    {items.map((emoji) => (
                        <label key={emoji.id} className="emoji-option">
                            <input
                                type="radio"
                                name="mood"
                                value={emoji.id}
                                checked={selected === emoji.id}
                                onChange={() => {
                                    setSelected(emoji.id);
                                    setSelectedText(emoji.message);
                                }}
                            />
                            <div>
                                <span
                                    className="emojiLabel"
                                    ref={(el) => (labelRefs.current[emoji.id] = el)}
                                >
                                    {emoji.label}
                                </span>
                                <img
                                    src={emoji.img}
                                    alt={emoji.label}
                                    className={selected === emoji.id ? "active" : ""}
                                />
                            </div>
                        </label>
                    ))}
                </article>
                <article id='moodRecordDialogBox'>
                    <p ref={textRef}>{selectedText}</p>
                </article>
            </main>
        </>
    );
}

function StressLevelRecord({moodData}) {
    
    const sliderRef = useRef(null);
    const thumbRef = useRef(null);
    const [labelX, setLabelX] = useState(50);
    const [value, setValue] = useState(50);
    const [stressLevel, setStressLevel] = useState("Moderate Stress");

    const updateStressLabel = (val) => {
        if (val <= 20) {
            setStressLevel("0% To 20% ==> Very Low Stress");
        } else if (val <= 40) {
            setStressLevel("21% To 40% ==> Low Stress");
        } else if (val <= 60) {
            setStressLevel("41% To 60% ==> Moderate Stress");
        } else if (val <= 80) {
            setStressLevel("61% To 80% ==> High Stress");
        } else {
            setStressLevel("81% To 100% ==> Very High Stress");
        }
    };

    const updatePosition = (val) => {
        const slider = sliderRef.current;
        const thumb = thumbRef.current;

        if (!slider || !thumb) return;

        const sliderRect = slider.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();

        const x = thumbRect.left - sliderRect.left + thumbRect.width / 2;

        setLabelX(x);
    };

    // ✅ Set initial value from moodData
    useEffect(() => {
        console.log("StressLevel moodData:", moodData); // Debug
        if (moodData && moodData !== undefined) {
            console.log("Setting stress to:", moodData); // Debug
            const stressValue = parseInt(moodData);
            setValue(stressValue);
            updateStressLabel(stressValue);
            // Wait a tick for refs to be available
            setTimeout(() => updatePosition(stressValue), 0);
        }
    }, [moodData]); // ✅ More specific dependency

    // Update position when value changes
    useEffect(() => {
        updatePosition(value);
    }, [value]);

    const handleSliderChange = (e) => {
        const newValue = parseInt(e.target.value);
        setValue(newValue);
        updateStressLabel(newValue);
    };

    // Create blue → red gradient
    const getGradient = (value) => {
        if (value == 50) {
            return "linear-gradient(to right, #e4b995ff 0%, #e4b995ff 100%)";
        } else if (value == 0) {
            return "linear-gradient(to right, #BFE5C8 0%, #BFE5C8 100%)";
        } else if (value == 100) {
            return "linear-gradient(to right, #ee7878ff 0%, #ee7878ff 100%)";
        }

        if (value < 50) {
            const percent = value * 2;
            return `linear-gradient(to left,
                #ee7878ff 0%,
                #e4b995ff ${percent}%,
                #BFE5C8 100%
            )`;
        }

        const percent = (value - 50) * 2;
        return `linear-gradient(to right,
            #BFE5C8 0%,
            #e4b995ff ${100 - percent}%,
            #ee7878ff 100%
        )`;
    };

    console.log(value);
    
    return(
        <>
            <main className='MainMoodFourth'>
                <h1>Wanna change your stress level ?</h1>
                <article className='stressWrapper'>
                    <div className="markWrapper"
                        style={{
                            top: "-25px",
                            left: `${labelX}px`,
                            background: getGradient(value)
                        }}  
                    >
                        <h2>{value}%</h2>
                    </div>
                    <div className="sliderCuztomize" ref={sliderRef} style={{ position: "relative" }}>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            name="stress"
                            value={value}
                            onChange={handleSliderChange}
                            style={{ width: "100%", background: getGradient(value)}}
                        />
                        <div
                            ref={thumbRef}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: `${value}%`, // ✅ Simplified - just use value directly
                                transform: "translate(-50%, -50%)",
                                width: "20px",
                                height: "20px",
                                pointerEvents: "none"
                            }}
                        />
                    </div>
                </article>
                <article className='stressRecordDialogBox'>
                    <p>{stressLevel}</p>
                </article>
            </main>
        </>
    );
}

function EntriesAdd({moodData}) {

   console.log("EntriesAdd rendered with moodData:", moodData); // ✅ Add debug

    const [selectedText, setSelectedText] = useState("Click On Either of The Emoji To Express Your Current Feelings!");
    const textRef = useRef(null);
    const labelRefs = useRef([]);

    const [selected, setSelected] = useState([]);
    const [selectedEntries, setSelectedEntries] = useState([]); // ✅ MOVE THIS HERE
    
    const checkboxRefs = useRef({});

    const academic = [
        { id: 1, label: "Assignment", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/AcademicIcon/assignmentIcon.png"
        },
        { id: 2, label: "Difficult Subject", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/AcademicIcon/difficultSubjectIcon.png"
        },
        { id: 3, label: "Exam", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/AcademicIcon/examIcon.png"
        },
        { id: 4, label: "Grade Stress", message: "Let’s gooo! The energy’s real — you’re on fire today!",
            img: "/AcademicIcon/gradeCGPAIcon.png"
        },
        { id: 5, label: "Group Work Stress", message: "Oops… that was awkward! But hey, nobody’s perfect — you’re still awesome!",
            img: "/AcademicIcon/groupWorkIcon.png"
        },
        { id: 6, label: "Lecturer Expectation", message: "Take a breath… you’ve got this. Turn that fire into focus.",
            img: "/AcademicIcon/lecturerIcon.png"
        },
        { id: 7, label: "Presentation", message: "It’s okay to cry — even rain helps flowers grow.",
            img: "/AcademicIcon/presentationIcon.png"
        },
        { id: 8, label: "Time Management", message: "Ugh… some days just test your patience. Breathe — you’re stronger than this.",
            img: "/AcademicIcon/timeManagementIcon.png"
        }
    ];

    const technical = [
        { id: 9, label: "Device Problem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/TechnicalIcon/deviceProblemIcon.png"
        },
        { id: 10, label: "Online Learning Issue", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/TechnicalIcon/onlineLearningIcon.png"
        },
        { id: 11, label: "Submission Problem", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/TechnicalIcon/submissionProblemIcon.png"
        }
    ];

    const social = [
        { id: 12, label: "Bully", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/SocialIcon/bullyIcon.png"
        },
        { id: 13, label: "Friendship Problem", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/SocialIcon/friendshipIcon.png"
        },
        { id: 14, label: "Loneliness", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/lonelinessIcon.png"
        },
        { id: 15, label: "Peer Comparison", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/peerComparisonIcon.png"
        },
        { id: 16, label: "Relationship Problem", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/relationshipIcon.png"
        }
    ];

    const emotional = [
        { id: 17, label: "Burnout Exhausted", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/EmotionalIcon/burnout_ExhaustedIcon.png"
        },
        { id: 18, label: "Low Motivation", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/EmotionalIcon/lowMotivationIcon.png"
        },
        { id: 19, label: "Poor Eating Habit", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/poorEatingHabitIcon.png"
        },
        { id: 20, label: "Self Doubt", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/selfDoubtIcon.png"
        },
        { id: 21, label: "Sleep Problem", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/sleepProblemIcon.png"
        }
    ];

    const financial = [
        { id: 22, label: "Financial Problem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/financialIcon/financialProblemIcon.png"
        },
        { id: 23, label: "Accomodation Issue", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/financialIcon/accomodationIssueIcon.png"
        },
        { id: 24, label: "Parttime Stress", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/financialIcon/parttimeWorkStressIcon.png"
        },
        { id: 25, label: "Transportation Issue", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/financialIcon/transportationIssueIcon.png"
        }
    ];

    const health = [
        { id: 26, label: "Lack of Exercise", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/HealthIcon/lackOfExerciseIcon.png"
        },
        { id: 27, label: "Mental Health Issue", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/HealthIcon/mentalHealthIcon.png"
        },
        { id: 28, label: "Physical Illness", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/HealthIcon/physicalIllnessIcon.png"
        },
        { id: 29, label: "Unconfortable Environment", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/HealthIcon/unconfortableEnvironmentIcon.png"
        }
    ];
    

    // Animate when text changes (For Emoji Message)
    useEffect(() => {
        // Hide all labels first
        labelRefs.current.forEach((label) => {
            if (label) {
                gsap.to(label, { opacity: 0, duration: 0.2 });
            }
        });

        // Show only selected labels
        selected.forEach((id) => {
            const el = labelRefs.current[id];
            if (el) {
                gsap.fromTo(
                    el,
                    { opacity: 0, margin: 0 },
                    { 
                        opacity: 1, 
                        duration: 0.6, 
                        ease: "back.out(8)" 
                    }
                );
            }
        });
    }, [selected]);

    // Now the useEffect can access selectedEntries
    useEffect(() => {
        console.log("Entries from moodData:", moodData?.entries); // Debug
        
        if (moodData && moodData.entries && Array.isArray(moodData.entries)) {
            console.log("Setting selected entries to:", moodData.entries); // Debug
            setSelectedEntries(moodData.entries);
            
            // Check the actual DOM checkboxes
            setTimeout(() => {
                moodData.entries.forEach(entryId => {
                    const checkbox = document.querySelector(`input[name="entries[]"][value="${entryId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log("Checked checkbox for entry:", entryId);
                    } else {
                        console.log("Checkbox NOT found for entry:", entryId);
                    }
                });
            }, 100); // Small delay to ensure DOM is ready
        }
    }, [moodData?.entries]);

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id)
            ? prev.filter((item) => item !== id)
            : [...prev, id]
        );
    };

    const handleAreaClick = (category, value) => {
        const checkbox = checkboxRefs.current[category];
        checkbox.checked = !checkbox.checked;
        
        if (selectedEntries.includes(category)) {
            setSelectedEntries(selectedEntries.filter(e => e !== category));
        } else {
            setSelectedEntries([...selectedEntries, category]);
        }
    };



    return(
        <>
            <main id="MainThird">
                <h1>Why Getting Bad Mood ? You Can Update More Than 1 Option</h1>
                <section id='wholeEntriesWrapper'>
                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(1) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(1)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 1));
                            } else {
                                setSelectedEntries([...selectedEntries, 1]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="1"
                            className="hiddenCheckbox"
                        />

                        <h2>Academic</h2>

                        <div className="iconContainer">
                            {academic.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(2) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(2)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 2));
                            } else {
                                setSelectedEntries([...selectedEntries, 2]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="2"
                            className="hiddenCheckbox"
                        />

                        <h2>Technical/ System Related</h2>

                        <div className="iconContainer">
                            {technical.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(3) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(3)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 3));
                            } else {
                                setSelectedEntries([...selectedEntries, 3]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="3"
                            className="hiddenCheckbox"
                        />

                        <h2>Social and Interpersonal</h2>

                        <div className="iconContainer">
                            {social.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(4) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(4)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 4));
                            } else {
                                setSelectedEntries([...selectedEntries, 4]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="4"
                            className="hiddenCheckbox"
                        />

                        <h2>Emotional and Personal Stressors</h2>

                        <div className="iconContainer">
                            {emotional.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(5) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(5)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 5));
                            } else {
                                setSelectedEntries([...selectedEntries, 5]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="5"
                            className="hiddenCheckbox"
                        />

                        <h2>Financial and Lifestyle</h2>

                        <div className="iconContainer">
                            {financial.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`entriesSelectionArea ${selectedEntries.includes(6) ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked; // Toggle the actual checkbox
                            
                            if (selectedEntries.includes(6)) {
                                setSelectedEntries(selectedEntries.filter(e => e !== 6));
                            } else {
                                setSelectedEntries([...selectedEntries, 6]);
                            }
                        }}
                    >
                        {/* Hidden checkbox but still part of form */}
                        <input
                            type="checkbox"
                            name="entries[]"
                            value="6"
                            className="hiddenCheckbox"
                        />

                        <h2>Health and Environment</h2>

                        <div className="iconContainer">
                            {health.map((icon) => (
                                <div key={icon.id} className="iconItem">
                                    <img src={icon.img} alt={icon.label} />
                                    <span className="iconLabel">{icon.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function NoteAdd({moodData}) {

    const [privacy, setPrivacy] = useState(false);

    useEffect(() => {
        if (moodData?.notePrivacy !== undefined) {
            setPrivacy(moodData?.notePrivacy == 1);
        }
    }, [moodData]);

    return(
        <>
            <main id="MainSecond">
                <h1>Wanna Update Your Note ?</h1>
                <div>
                    <textarea 
                        placeholder="Write Some Notes For Today Feeling!" 
                        name="note" 
                        defaultValue={moodData?.note || ""}
                        required
                    />
                    <label>
                        <input 
                            type="checkbox" 
                            name="notePrivacy" 
                            value="1" 
                            checked={privacy}
                            onChange={(e) => setPrivacy(e.target.checked)}
                        />
                        Keep Note As Privacy? Note Will Be Shared To PA and Counsellor If This Option Isn't Get Checked
                    </label>
                </div>
            </main>
        </>
    );
}

function RecordMoodNote() {

        // Get the moodId from MoodRecordView.js or CalendarMoodRecordView.js
        const { moodId, from } = useParams();

        const [moodRecordData, setMoodRecordData] = useState({});

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
            const shouldRedirect = messagebox.redirect;
            setMessagebox({ ...messagebox, show: false });

            if (shouldRedirect) {

                // ✔ Check if moodRecordData has the date
                if (moodRecordData?.moodRecord?.datetimeRecord) {

                    // Get date after recorded
                    const recordDate = moodRecordData.moodRecord.datetimeRecord.split(" ")[0];

                    const today = new Date().toISOString().split("T")[0];

                    if (recordDate === today && from == "Today") {
                        window.location.href = "/MoodRecordView";
                    } else if (from == "Specific") {
                        window.location.href = `/MoodRecordViewSpecific/${moodId}`;
                    } else {
                        window.location.href = `/CalendarMoodRecordView/${recordDate}`;
                    }

                } else {
                    // ✔ fallback if mood data not ready
                    window.location.href = "/MoodRecord";
                }
            }
        };

    
        const token = localStorage.getItem("token");

        // Use to check data
        useEffect(() => {
            const token = localStorage.getItem("token");
    
            if(!token){
                // No token, redirect to login
                window.location.href = "/";
                return;
            }
    
            fetch(`http://localhost:8080/care_connect_system/backend/api/getEditMoodRecord.php?moodId=${moodId}&date=${from}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            .then(res => res.json())
            .then(data => {
                console.log("Mood Data Received:", data);   // ← VERY IMPORTANT
                
                if(data.success){
                setMoodRecordData(data);

                } else {
                    // Token invalid → clear storage & redirect
                    localStorage.clear();
                    window.location.href = "/";
                }
            })
            .catch(err => console.error(err));
        }, []);

        // Use to complete the form
        const handleMoodRecord = async (e) => {
            e.preventDefault();
    
            const formData = new FormData(e.target);

            const response = await fetch(`http://localhost:8080/care_connect_system/backend/api/editMoodRecord.php?moodId=${moodId}&date=${from}`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const result = await response.json();

            if(result.success){
                setMessagebox({
                    show: true,
                    title: "Daily Mood Updated Successful",
                    message: result.message,
                    buttonValue: "OK",
                    redirect: true
                });
            } else {
                setMessagebox({
                    show: true,
                    title: "Daily Mood Updated Failed",
                    message: result.message,
                    buttonValue: "Try Again",
                    redirect: false
                });
            }

        };

        if (moodRecordData.finishRecord) {
            return (
                <div className="finishRecorded">
                    <p>
                        {moodRecordData.message}
                    </p>
                </div>
            );
        }

    return(
        <>
            <form id="formFirst" onSubmit={handleMoodRecord}>
                <MoodChoose moodData={moodRecordData?.moodRecord}/>
                <StressLevelRecord moodData={moodRecordData?.stressLevel}/>
                <EntriesAdd moodData={moodRecordData}/>
                <NoteAdd moodData={moodRecordData?.moodRecord}/>
                <div id="buttonMoodRecordWrapper">
                    <input type="reset" value="Reset Mood Choose"></input>
                    <input type="submit" value="Update Your Mood"></input>
                </div>
            </form>
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

export default EditMoodRecord;