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

export function ConfirmationModal({
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

export function MoodRecommendationModal({
  isOpen,
  onClose,
  onViewDetails,
  mood,
  moodStoreLocation,
  stressColor,
  stressValue,
  stressLevel,
  recommendationType,
  recommendation,
  recommendationLink
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        
        <h2 className="modal-title">
            <span  span className="sectionTitle">Recorded Mood</span>
        </h2>

        <div className="recordedDetailsWrapper">
            <section>
                <img src={moodStoreLocation ? moodStoreLocation : ""}></img>
                <h4>{mood ? mood : "Anxious"}</h4>
            </section>
            <section>
                <p
                    style={{
                        backgroundColor: stressValue ? stressColor : "#c1c1c1ff"
                    }}
                >{stressValue ? stressValue + "%" : "N/A"}</p>
                <h4>{stressLevel ? stressLevel : "N/A"}</h4>
            </section>
        </div>

        <div className="recommendationWrapper">
            <h3 className="sectionTitle recommendation">Recommendation</h3>
            {recommendationType === "game" ?
                <a href={recommendationLink ? recommendationLink : ""} target="_blank">
                    {recommendation ? recommendation : "Take a short break and breathe deeply"}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                        <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
                    </svg>
                </a>
            :
                <p>{recommendation ? recommendation : "Take a short break and breathe deeply"}</p>
            }
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn primary" onClick={onViewDetails}>
            View Details
          </button>
        </div>

      </div>
    </div>
  );
}

export default Modal;
