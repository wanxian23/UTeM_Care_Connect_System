import React from "react";

function Modal({ show, title, message, buttonValue, onClose }) {
    if(!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onClose}>{buttonValue}</button>
            </div>
        </div>
    );
}

export default Modal;
