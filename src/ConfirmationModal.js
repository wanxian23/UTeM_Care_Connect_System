import React from "react";
import "./css/Modal.css"; // optional

function ConfirmationModal({
    show,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>{title}</h2>
                <p>{message}</p>

                <div className="modal-buttons">
                    <button className="modal-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>

                    <button className="modal-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
