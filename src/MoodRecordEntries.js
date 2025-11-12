import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {Header, Footer} from "./HeaderFooter";
import {SubHeader} from "./MoodRecord";
import { Link } from "react-router-dom";

import "./css/MoodRecord.css";

function MoodRecordEntries() {
    return(
        <>
            <Header />
            <SubHeader />
            <EntriesAdd />
            <Footer />
        </>
    );
}

function EntriesAdd() {

    const [selectedText, setSelectedText] = useState("Click On Either of The Emoji To Express Your Current Feelings!");
    const textRef = useRef(null); // Create the reference

    const [selected, setSelected] = useState([]);

    const academic = [
        { id: "a1", label: "assignment", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/AcademicIcon/assignmentIcon.png"
        },
        { id: "a2", label: "difficultSubject", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/AcademicIcon/difficultSubjectIcon.png"
        },
        { id: "a3", label: "exam", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/AcademicIcon/examIcon.png"
        },
        { id: "a4", label: "gradeStress", message: "Let’s gooo! The energy’s real — you’re on fire today!",
            img: "/AcademicIcon/gradeCGPAIcon.png"
        },
        { id: "a5", label: "groupWorkStress", message: "Oops… that was awkward! But hey, nobody’s perfect — you’re still awesome!",
            img: "/AcademicIcon/groupWorkIcon.png"
        },
        { id: "a6", label: "lecturerExpectation", message: "Take a breath… you’ve got this. Turn that fire into focus.",
            img: "/AcademicIcon/lecturerIcon.png"
        },
        { id: "a7", label: "presentation", message: "It’s okay to cry — even rain helps flowers grow.",
            img: "/AcademicIcon/presentationIcon.png"
        },
        { id: "a8", label: "timeManagement", message: "Ugh… some days just test your patience. Breathe — you’re stronger than this.",
            img: "/AcademicIcon/timeManagementIcon.png"
        }
    ];

    const technical = [
        { id: "t1", label: "deviceProblem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/TechnicalIcon/deviceProblemIcon.png"
        },
        { id: "t2", label: "difficultSubject", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/TechnicalIcon/onlineLearningIcon.png"
        },
        { id: "t3", label: "exam", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/TechnicalIcon/submissionProblemIcon.png"
        }
    ];

    const social = [
        { id: "s1", label: "friendshipProblem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/SocialIcon/bullyIcon.png"
        },
        { id: "s2", label: "difficultSubject", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/SocialIcon/friendshipIcon.png"
        },
        { id: "s3", label: "loneliness", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/lonelinessIcon.png"
        },
        { id: "s4", label: "peerComparison", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/peerComparisonIcon.png"
        },
        { id: "s5", label: "relationship", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/SocialIcon/relationshipIcon.png"
        }
    ];

    const emotional = [
        { id: "e1", label: "friendshipProblem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/EmotionalIcon/burnout_ExhaustedIcon.png"
        },
        { id: "e2", label: "difficultSubject", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/EmotionalIcon/lowMotivationIcon.png"
        },
        { id: "e3", label: "loneliness", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/poorEatingHabitIcon.png"
        },
        { id: "e4", label: "peerComparison", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/selfDoubtIcon.png"
        },
        { id: "e5", label: "relationship", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/EmotionalIcon/sleepProblemIcon.png"
        }
    ];

    const financial = [
        { id: "f1", label: "financialProblem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/financialIcon/financialProblemIcon.png"
        },
        { id: "f2", label: "accomodationIssue", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/financialIcon/accomodationIssueIcon.png"
        },
        { id: "f3", label: "parttimeStress", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/financialIcon/parttimeWorkStressIcon.png"
        },
        { id: "f4", label: "transportationIssue", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/financialIcon/transportationIssueIcon.png"
        }
    ];

    const health = [
        { id: "h1", label: "financialProblem", message: "Let your smile be the sunshine that brightens someone’s day — including your own!", 
            img: "/HealthIcon/lackOfExerciseIcon.png"
        },
        { id: "h2", label: "accomodationIssue", message: "You’ve got that unstoppable spark — own the moment, rule the vibe!",
            img: "/HealthIcon/mentalHealthIcon.png"
        },
        { id: "h3", label: "parttimeStress", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/HealthIcon/physicalIllnessIcon.png"
        },
        { id: "h4", label: "transportationIssue", message: "Every big idea starts with a little spark — take your time to think it through.",
            img: "/HealthIcon/unconfortableEnvironmentIcon.png"
        }
    ];

    // Animate when text changes (For Emoji Message)
    useEffect(() => {
        if (selectedText) {
        gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.6, ease: "back.out(8)" }
        );
        } else {
        gsap.to(textRef.current, { opacity: 0, y: -10, duration: 0.4 });
        }
    }, [selectedText]);

    const handleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id)
            ? prev.filter((item) => item !== id) // remove if already selected
            : [...prev, id] // add if not selected
        );
    };

    return(
        <>
            <main id="MainThird">
                <h1>Any Entries Wanna Add ?</h1>
                <form id='wholeEntriesWrapper'>
                    <div>
                        <h2>Acedemic</h2>
                        <div>
                        {academic.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Technical/ System-Related</h2>
                        <div>
                        {technical.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Social and Interpersonal</h2>
                        <div>
                        {social.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Emotional and Personal Stressors</h2>
                        <div>
                        {emotional.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Financial and Lifestyle</h2>
                        <div>
                        {financial.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Health and Environment</h2>
                        <div>
                        {health.map((icon) => (
                            <label key={icon.id}>
                            <input
                            type="checkbox"
                            name="mood"
                            value={icon.id}
                            checked={selected.includes(icon.id)}
                            onChange={() => handleSelect(icon.id)}
                            onClick={() => setSelectedText(icon.message)}
                            />
                            <img
                                src={icon.img}
                                alt={icon.label}
                                className={selected === icon.id ? "active" : ""}
                            />
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h2>Short Note</h2>
                        <div>
                            <textarea placeholder="Add A Short Note For Your Created Entry!"></textarea>
                        </div>
                    </div>
                    <div>
                        <input type="reset" value="Reset Entry" />
                        <input type="submit" value="Add Entry" />
                    </div>
                    {/* {items.map((emoji) => (
                        <label key={emoji.id} className="emoji-option">
                        <input
                            type="checkbox"
                            name="mood"
                            value={emoji.id}
                            checked={selected === emoji.id}
                            onChange={() => setSelected(emoji.id)}
                            onClick={() => setSelectedText(emoji.message)}
                        />
                        <img
                            src={emoji.img}
                            alt={emoji.label}
                            className={selected === emoji.id ? "active" : ""}
                        />
                        </label>
                    ))} */}
                </form>
                {/* <article id='dialogBox'>
                    <p ref={textRef}>{selectedText}</p>
                </article> */}
            </main>
        </>
    );
}

export default MoodRecordEntries;