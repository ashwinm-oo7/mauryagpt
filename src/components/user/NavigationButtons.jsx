import React from "react";
import "./css/NavigationButtons.css";
const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
}) => (
  <div className="navigation-btns">
    <button onClick={onPrev} disabled={currentStep === 0}>
      Previous
    </button>
    {currentStep < totalSteps - 1 ? (
      <button onClick={onNext}>Next</button>
    ) : (
      <button onClick={onSubmit}>Submit</button>
    )}
  </div>
);

export default NavigationButtons;
