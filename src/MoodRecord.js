import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {Header, Footer} from "./HeaderFooter";
import { NavLink } from "react-router-dom";

import "./css/MoodRecord.css";

function MoodRecord() {
    return(
        <>
            <Header />
            <SubHeader />
            <RecordMoodNote />
            <Footer />
        </>
    );
}

export function SubHeader() {
    return(
        <>
            <main id="MoodRecordSubHeaderWrapper">
            <NavLink
                to="/MoodRecord"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader leftSelected" : "subButton"
                }
            >
            Today Mood Record
            </NavLink>

            <NavLink
                to="/MoodRecordEntries"
                className={({ isActive }) =>
                    isActive ? "subButton selectedSubHeader rightSelected" : "subButton"
                }
            >
            Entries Record
            </NavLink>
            </main>
        </>
    );
}

function MoodChoose() {
    const [selectedText, setSelectedText] = useState("Click On Either of The Emoji To Express Your Current Feelings!");
    const textRef = useRef(null); // Create the reference

    const [selected, setSelected] = useState(null);

    const items = [
        { id: 1, label: "pinkHappy", message: "Aww, you look really happy today! Keep that positive vibe going!", 
            img: "/EmotionCuteEmoji/1.png"
        },
        { id: 2, label: "yellowKing", message: "Wow, feeling confident today? You’re totally owning it!", 
            img: "/EmotionCuteEmoji/2.png"
        },
        { id: 3, label: "orangeThinking", message: "Hmm, you look deep in thought. Take your time — every great idea starts somewhere.", 
            img: "/EmotionCuteEmoji/3.png"
        },
        { id: 4, label: "yellowExcited", message: "You seem so excited today! Something awesome must’ve happened!", 
            img: "/EmotionCuteEmoji/4.png"
        },
        { id: 5, label: "greenEmbrarassing", message: "Feeling a bit embarrassed? It’s okay, everyone has those moments!", 
            img: "/EmotionCuteEmoji/5.png"
        },
        { id: 6, label: "redAngry", message: "You look upset… wanna take a breather first? It’s okay to feel angry sometimes.", 
            img: "/EmotionCuteEmoji/6.png"
        },
        { id: 7, label: "blueCrying", message: "Aww, are you feeling down today? It’s okay to cry — you’re not alone.", 
            img: "/EmotionCuteEmoji/7.png"
        },
        { id: 8, label: "purpleAnnoying", message: "Ugh, looks like something’s annoying you. Wanna talk about it?", 
            img: "/EmotionCuteEmoji/8.png"
        },
        { id: 9, label: "blueJoking", message: "Haha, looks like you’re in a playful mood today! Keep spreading that joy!", 
            img: "/EmotionCuteEmoji/9.png"
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

    return(
        <>
            <main id='MainFirst'>
                <h1>How Was Your Mood Today ?</h1>
                <article id='emojiWrapper'>
                    {items.map((emoji) => (
                        <label key={emoji.id} className="emoji-option">
                        <input
                            type="radio"
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
                    ))}
                </article>
                <article id='moodRecordDialogBox'>
                    <p ref={textRef}>{selectedText}</p>
                </article>
            </main>
        </>
    );
}

function NoteAdd() {
    return(
        <>
            <main id="MainSecond">
                <h1>Any Notes Wanna Add ?</h1>
                    <textarea placeholder="Write Some Notes For Today Feeling!">

                    </textarea>
            </main>
        </>
    );
}

function RecordMoodNote() {
    return(
        <>
            <form id="formFirst">
                <MoodChoose />
                <NoteAdd />
                <div id="buttonMoodRecordWrapper">
                    <input type="reset" value="Reset Mood Choose"></input>
                    <input type="submit" value="Record Your Mood"></input>
                </div>
            </form>
        </>
    );
}

export default MoodRecord;